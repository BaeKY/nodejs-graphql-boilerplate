/* eslint-disable @typescript-eslint/no-var-requires */
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import { ApolloServer } from "apollo-server-express";
import express, { Express } from "express";
import { createSchema } from "./utils/createSchema";
import { v4 as uuidv4 } from "uuid";
import Container, { ContainerInstance } from "typedi";
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
            context: async () => {
                // 아래 링크 참조!
                // https://github.com/MichalLytek/type-graphql/blob/v1.1.1/examples/using-scoped-container/index.ts
                const requestId = uuidv4();
                const container = Container.of(requestId); // get scoped container
                const context = { requestId, container }; // create our context
                container.set("context", context); // place context or other data in container
                return context;
            },
            uploads: {
                // 20MB
                maxFieldSize: 20480000,
            },
            playground,
            introspection: true,
            plugins: [
                {
                    requestDidStart: () => ({
                        willSendResponse(requestContext) {
                            // remember to dispose the scoped container to prevent memory leaks
                            Container.reset(requestContext.context.requestId);

                            // for developers curiosity purpose, here is the logging of current scoped container instances
                            // we can make multiple parallel requests to see in console how this works
                            const instancesIds = ((Container as any)
                                .instances as ContainerInstance[]).map(
                                (instance) => instance.id
                            );
                            console.log(
                                "instances left in memory:",
                                instancesIds
                            );
                        },
                    }),
                },
            ],
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
