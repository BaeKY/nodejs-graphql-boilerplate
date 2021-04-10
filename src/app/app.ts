import cors from "cors";
import helmet from "helmet";
import { ApolloServer } from "apollo-server-express";
import express, { Express, RequestHandler } from "express";
import { createSchema } from "../utils/createSchema";
import cookieParser from "cookie-parser";
import { IS_DEV_ENV } from "../constants";
import { ComplexityPlugin } from "../plugins/complexity";
import { graphqlUploadExpress } from "graphql-upload"
import { createSessionMiddleware } from "./config/session";
import passport from "passport";
import { usePassport } from "./config/passport";

declare module 'express-session' {
    interface SessionData {
        passport: any;
    }
};

const corsOrigin = [
    'http://localhost:3000',
    'http://localhost:5003'
];

const corsOption = {
    credentials: true,
    origin: corsOrigin
};

class App {
    private readonly gqlEndPoint: string = process.env.GRAPHQL_ENDPOINT ?? '/gql'
    private sessionMiddleware!: RequestHandler
    public server!: ApolloServer;
    public app!: Express;

    async init(): Promise<Express> {
        const playground = Boolean(process.env.ENABLE_PLAYGROUND).valueOf();
        this.app = express();

        const schema = await createSchema();
        // TODO: passport 로직 ㄱㄱ

        this.middlewares();
        this.addRoutes();

        this.server = new ApolloServer({
            schema,
            context: async (context) => {
                context["dateTimeOffsetHours"] = parseInt(
                    process.env.DATETIME_OFFSET_HOURS || "9"
                );
                return context;
            },
            uploads: false,
            plugins: [ComplexityPlugin(schema)],
            playground,
            introspection: true,
            debug: IS_DEV_ENV,
        });

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
        this.app.use(
            graphqlUploadExpress({
                maxFileSize: 50000000, // 50 MB
                maxFiles: 30,
                maxFieldSize: 50000000 // 50 MB
            })
        )
        this.app.use(cors(corsOption))

        // Express Middleware Setup!
        this.sessionMiddleware = createSessionMiddleware({
            sessionCookieName: 'SSID',
            mongoUrl: process.env.DB_URI ?? ''
        })
        this.app.use(this.sessionMiddleware)
        // helmet에 playground loading 이슈 있음... ㅜㅜ
        this.app.use(
            helmet({
                contentSecurityPolicy:
                    process.env.NODE_ENV === 'production' ? undefined : false
            })
        )
        this.app.use(cookieParser(process.env.COOKIE_SECRET))
        this.app.use(express.json())
        this.app.use(
            express.urlencoded({
                extended: true
            })
        )
        this.app.set('trust proxy', true)
        usePassport(this.app)
    };

    private readonly addRoutes = (): void => {
        this.app.get(
            '/auth/google',
            passport.authenticate('google', {
                scope: ['profile', 'email']
            })
        )
        this.app.get(
            '/auth/google/callback',
            passport.authenticate('google', { failureRedirect: '/login' }),
            (req, res) => {
                console.log(
                    'Auth Done ========================================================================='
                )
                // Session User를 context에 Setting 한다!
                console.log({ resultUser: req.user })
                // Successful authentication, redirect home.
                res.redirect('/')
            }
        )
    }
}

export default new App();
