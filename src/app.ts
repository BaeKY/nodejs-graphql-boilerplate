/* eslint-disable @typescript-eslint/no-var-requires */
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import { ApolloServer } from "apollo-server-express";
import express, { Express } from "express";
import { createSchema } from "./utils/createSchema";
import cookieParser from "cookie-parser";
import { JwtPayload } from "./types/types";
import { accessTokenVerify } from "./utils/jwtUtils";
import { ACCESS_COOKIE_NAME } from "./passport/strategies";

class App {
    public server: ApolloServer;
    public app: Express;
    private gqlEndPoint: string = process.env.GRAPHQL_ENDPOINT || "/gql";

    async init(): Promise<Express> {
        const playground = Boolean(process.env.ENABLE_PLAYGROUND).valueOf();
        this.app = express();

        const schema = await createSchema();
        // TODO: passport 로직 ㄱㄱ

        this.server = new ApolloServer({
            schema,
            context: async (context) => {
                context["dateTimeOffsetHours"] = parseInt(
                    process.env.DATETIME_OFFSET_HOURS || "9"
                );
                // Check AccessToken from "SignedCookies" & Set authinfo to "context"
                {
                    const accessToken =
                        context.req.signedCookies[ACCESS_COOKIE_NAME];
                    if (accessToken) {
                        const jwtPayload = accessTokenVerify<JwtPayload>(
                            accessToken
                        );
                        context["userPayload"] = jwtPayload;
                    }
                }
                return context;
            },
            uploads: {
                // 20MB
                maxFieldSize: 20480000,
            },
            playground,
            introspection: true,
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
        this.app.use(cookieParser(process.env.COOKIE_SECRET));
        this.app.use(
            express.urlencoded({
                extended: true,
            })
        );
        // usePassport(this.app);
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
