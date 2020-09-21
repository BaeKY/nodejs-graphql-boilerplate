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
import { UserModel } from "./models/User/User.type";
import { loggerCloudWatch } from "./logger";
import { ObjectId } from "mongodb";
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
            playground,
            plugins: [
                {
                    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                    requestDidStart: (requestContext) => {
                        const query = requestContext.request.query;
                        const time = Date.now();
                        const isNotIntrospectionQuery =
                            query &&
                            !query.startsWith("query IntrospectionQuery");
                        let errorId: string;
                        return {
                            didEncounterErrors(ctx) {
                                // TODO: 로깅!
                                // query level error는 여기서 찍힘. But, Business level error는 그냥 통과함.
                                // 슬랙 Notification 필요.
                                if (isNotIntrospectionQuery) {
                                    errorId = new ObjectId().toHexString();
                                    loggerCloudWatch.error(
                                        JSON.stringify({
                                            errorId,
                                            errors: ctx.errors,
                                        })
                                    );
                                }
                            },
                            // 얘가 항상 마지막임.
                            willSendResponse(ctx) {
                                // access logging & business level error logging
                                if (isNotIntrospectionQuery) {
                                    // TODO: 로깅!
                                    const user = ctx.context.user;
                                    const log = {
                                        resTime: Date.now() - time,
                                        request: {
                                            operation: ctx.operation?.operation,
                                            httpHeaders:
                                                ctx.context.req.headers,
                                            user: {
                                                _id: user?._id,
                                                name: user?.name || "Anonymous",
                                                email: user?.email,
                                                role: user?.role,
                                                zoneinfo: user.zoneinfo,
                                                ip: getIpAddress(
                                                    ctx.context.req
                                                ),
                                            },
                                            query: ctx.source,
                                            variables: ctx.request.variables,
                                        },
                                        response: {
                                            http: ctx.response.http,
                                            data: ctx.response.data,
                                            errors:
                                                ctx.response.errors ||
                                                ctx.errors,
                                        },
                                        errorId,
                                    };
                                    loggerCloudWatch.info(JSON.stringify(log));
                                    // console.log(JSON.stringify(log));
                                }
                            },
                        };
                    },
                },
            ],
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
