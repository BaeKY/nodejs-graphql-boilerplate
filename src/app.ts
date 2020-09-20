/* eslint-disable @typescript-eslint/no-var-requires */
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import { ApolloServer } from "apollo-server-express";
import express, { Express } from "express";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { createSchema } from "./utils/createSchema";
import { createCollections } from "./utils/createCollections";
import { mongoose } from "@typegoose/typegoose";
import session from "express-session";
import { ONE_DAY } from "./utils/variables";
import { loggerCloudWatch } from "./logger";
import { UserModel } from "./models/User/User.type";
import { getIpAddress } from "./utils/httpFunctions";

const MongoStore = require("connect-mongo")(session);

class App {
    public server: ApolloServer;
    public app: Express;
    private gqlEndPoint: string = process.env.GRAPHQL_ENDPOINT || "/graphql";

    async init(): Promise<Express> {
        const playground = Boolean(process.env.ENABLE_PLAYGROUND).valueOf();
        this.app = express();

        const schema = await createSchema();
        this.server = new ApolloServer({
            schema,
            context: async (context): Promise<ExpressContext> => {
                const session = context.req.session;
                if (!session) {
                    return context;
                }
                const sellerId = session["seller"];
                if (sellerId) {
                    const user = await UserModel.findOne({
                        _id: session["seller"],
                    });
                    if (user) {
                        context["user"] = user;
                    }
                }
                return context;
            },
            uploads: {
                // 20MB
                maxFieldSize: 20480000,
            },
            formatError: (err) => {
                console.log(err);
                return err;
            },
            plugins: [
                {
                    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                    requestDidStart: (requestContext) => {
                        const query = requestContext.request.query;
                        const time = Date.now();
                        const letsLogging =
                            query &&
                            !query.startsWith("query IntrospectionQuery");
                        return {
                            didEncounterErrors(ctx) {
                                // TODO: 로깅!
                                console.log({ errors: ctx.errors });
                            },
                            // 얘가 항상 마지막임.
                            willSendResponse(ctx) {
                                if (letsLogging) {
                                    // TODO: 로깅!
                                    const user = ctx.context.user;
                                    const log = {
                                        res: `${Date.now() - time} ms`,
                                        httpHeaders: {
                                            ...ctx.context.req.headers,
                                            ip: getIpAddress(ctx.context.req),
                                        },
                                        user: user
                                            ? {
                                                  _id: user._id,
                                                  name: user.name,
                                                  email: user.email,
                                                  role: user.role,
                                                  zoneinfo: user.zoneinfo,
                                              }
                                            : "Anonymous",
                                        query: ctx.request.query,
                                        variables: ctx.request.variables,
                                        response: {
                                            http: ctx.response.http,
                                            data: ctx.response.data,
                                            errors: ctx.response.errors,
                                        },
                                    };
                                    const isError =
                                        !!(log.response.errors?.length !== 0) ||
                                        !!log.response.data?.ok;
                                    if (isError) {
                                        loggerCloudWatch.info(
                                            JSON.stringify(log)
                                        );
                                    } else {
                                        loggerCloudWatch.error(
                                            JSON.stringify(log)
                                        );
                                    }
                                    // console.log(JSON.stringify(log));
                                }
                            },
                        };
                    },
                },
            ],
            playground,
        });
        this.middlewares();
        this.server.applyMiddleware({
            app: this.app,
            path: this.gqlEndPoint,
            onHealthCheck: () => {
                return new Promise((resolve) => {
                    // DB상태 체크
                    // 테스트 쿼리 동작 확인
                    // Replace the `true` in this conditional with more specific checks!

                    // if (req.get("health")) {
                    resolve();
                    // } else {
                    //     reject("boooooooooooo");
                    // }
                });
            },
        });
        await createCollections();
        return this.app;
    }

    private middlewares = (): void => {
        this.app.use(cors());
        this.app.use(helmet());

        // MongoDB for Session Storage
        this.app.use(
            session({
                name: "qid",
                secret: process.env.JD_TIMESPACE_SECRET || "",
                resave: false,
                saveUninitialized: false,
                store: new MongoStore({
                    mongooseConnection: mongoose.connection,
                }),
                cookie: {
                    httpOnly: true,
                    domain: ".stayjanda.cloud",
                    sameSite: "lax",
                    maxAge: ONE_DAY * 14,
                },
            })
        );
        this.useLogger();
    };

    private useLogger = (): void => {
        logger.token("remote-addr", (req) => {
            const ffHeaderValue = req.headers["x-forwarded-for"];
            if (typeof ffHeaderValue === "string") {
                return ffHeaderValue;
            }
            return (
                (ffHeaderValue && ffHeaderValue[0]) ||
                req.connection.remoteAddress ||
                ""
            );
        });
        this.app.use(
            logger(
                `[:date[iso]] :remote-addr :url(:method :status) :user-agent`
            )
        );
    };
}

export default new App();
