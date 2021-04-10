import passport, { Strategy } from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Express } from 'express'
import { User } from '../../modules/User/User.type'
import { UserModel } from '../../modules/User/User.service'
import { Request } from "express";
import {
    ExtractJwt,
    Strategy as JwtStrategy,
    VerifiedCallback,
} from "passport-jwt";
import { UserJWTPayload } from "../../types/types";

interface IStrategy {
    name: string
    strategy: Strategy
}
export const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME || "jwt";
export const strategies: IStrategy[] = [
    {
        name: 'google',
        strategy: new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID ?? '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
                callbackURL: process.env.GOOGLE_AUTH_CALLBACK
            },
            (_accessToken, _refreshToken, profile, done): void => {
                UserModel.findOne(
                    {
                        googleId: profile.id
                    },
                    (err, existingUser) => {
                        const user: User | undefined =
                            existingUser ??
                            Object.assign(new User(), {
                                email: profile._json.email,
                                name: profile.displayName,
                                googleId: profile.id,
                                timezone: "Asia/Seoul"
                            })
                        if (existingUser == null) {
                            const userInstance = new UserModel(user)
                            userInstance.save().then(() =>
                                done(err, userInstance)
                            ).catch((err) => {
                                console.log(err)
                            })
                        } else {
                            done(err, user)
                        }
                    }
                ).then((user) => {
                    console.log({ passportUser: user })
                }).catch((err) => {
                    console.log(err)
                })
            }
        )
    },
    {
        name: "JWT",
        strategy: new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([
                    (req) => {
                        let token: string | null = null;
                        console.log(`Cookies: ${req.signedCookies}`);
                        if (req && req.signedCookies) {
                            token = req.signedCookies[ACCESS_COOKIE_NAME];
                        }
                        console.log({ token });
                        return token;
                    },
                ]),
                // jwtFromRequest: (req) => req.signedCookies[ACCESS_COOKIE_NAME],
                secretOrKey: process.env.JWT_SECRET,
            },
            async (req: Request, payload: UserJWTPayload, done: VerifiedCallback) => {
                try {
                    // 브라우저 검사
                    if (req.get("user-agent") !== payload.userAgent) {
                        return done(null);
                    }
                    return done(null, payload);
                } catch (error) {
                    return done(error);
                }
            }
        )
    }
]


export const usePassport = (app: Express): void => {
    // session cookie 사용 안함.

    passport.serializeUser((user, done) => {
        done(null, user)
    })
    passport.deserializeUser<any>((user, done) => {
        done(null, user)
    })
    for (const { name, strategy } of strategies) {
        passport.use(name, strategy)
    }

    app.use(passport.initialize())
    app.use(passport.session())
}
