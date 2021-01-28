/* eslint-disable @typescript-eslint/no-var-requires */
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import { ApolloServer } from "apollo-server-express";
import express, { Express } from "express";
import { createSchema } from "./utils/createSchema";
import session from "express-session";
import { ONE_DAY } from "./constants";

const MongoStore = require("connect-mongo")(session);

class App {
    public server: ApolloServer;
    public app: Express;
    private gqlEndPoint: string = process.env.GRAPHQL_ENDPOINT || "/gql";

    async init(): Promise<Express> {
        const playground = Boolean(process.env.ENABLE_PLAYGROUND).valueOf();
        this.app = express();

        const schema = await createSchema();
        this.server = new ApolloServer({
            schema,
            context: async (expressContext) => {
                expressContext["dateTimeOffsetHours"] = parseInt(
                    process.env.DATETIME_OFFSET_HOURS || "9"
                );
                return expressContext;
            },
            uploads: {
                // 20MB
                maxFieldSize: 20480000,
            },
            playground,
            introspection: true,
        });

        // MongoDB for Session Storage
        this.app.use(
            session({
                name: "qid",
                secret: process.env.SESSION_SECRET || "",
                resave: false,
                saveUninitialized: false,
                store: new MongoStore({
                    url: process.env.DB_URI,
                }),
                cookie: {
                    httpOnly: true,
                    domain: ".stayjanda.cloud",
                    sameSite: "lax",
                    maxAge: ONE_DAY * 14,
                },
            })
        );
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
                    resolve("Healty");
                    // } else {
                    //     reject("boooooooooooo");
                    // }
                });
            },
        });
        return this.app;
    }

    private middlewares = (): void => {
        this.app.use(cors());
        this.app.use(helmet());

        this.setupSystemLogging();
    };

    private setupSystemLogging = (): void => {
        logger.token("remote-addr", (req) => {
            const ffHeaderValue = req.headers["x-forwarded-for"];
            if (typeof ffHeaderValue === "string") {
                return ffHeaderValue;
            }
            return (
                (ffHeaderValue && ffHeaderValue[0]) ||
                req.socket.remoteAddress ||
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
