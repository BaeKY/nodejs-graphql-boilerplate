/* eslint-disable @typescript-eslint/no-var-requires */
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import { ApolloServer } from "apollo-server-express";
import express, { Express } from "express";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { createSchema } from "./utils/createSchema";
import { ObjectId } from "mongodb";
import { createCollections } from "./utils/createCollections";
import { mongoose } from "@typegoose/typegoose";
import session from "express-session";
import { ONE_DAY } from "./utils/variables";

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
            context: async (ctx): Promise<ExpressContext> => {
                ctx.req["user"] = "";
                return ctx;
            },
            uploads: {
                // 20MB
                maxFieldSize: 20480000,
            },
            plugins: [
                {
                    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                    requestDidStart: (ctx) => {
                        const reqId = new ObjectId();
                        ctx.context["reqId"] = reqId;
                        // TODO: CloudWatch로 로깅!
                        // mLogger 이용하기
                        return {
                            parsingDidStart(): void {
                                // TODO: 로깅!
                            },
                            didEncounterErrors(): void {
                                // TODO: 로깅!
                            },
                            willSendResponse(): void {
                                // TODO: 로깅!
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
