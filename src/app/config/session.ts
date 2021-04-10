import session from 'express-session'
import MongoStore from 'connect-mongo'
import { ONE_DAY } from '../../constants'
import { RequestHandler } from 'express'

export const createSessionMiddleware = (input: {
    sessionCookieName: string
    mongoUrl: string
}): RequestHandler => {
    const { sessionCookieName: cookieName, mongoUrl } = input
    const sessionMiddleware = session({
        name: cookieName,
        secret: process.env.SESSION_SECRET ?? '',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl
        }),
        cookie: {
            // Production, local 개발일때 환경 나눠야됨
            httpOnly: true,
            maxAge: ONE_DAY * 14,
            ...(process.env.NODE_ENV === 'prod'
                ? {
                    domain: process.env.DOMAIN_FOR_COOKIE,
                    sameSite: 'none',
                    secure: true
                }
                : {
                    domain: 'localhost',
                    sameSite: 'lax',
                    secure: false
                })
        }
    })
    return sessionMiddleware
}
