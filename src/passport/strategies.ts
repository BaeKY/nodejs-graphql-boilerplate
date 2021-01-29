import { Request } from "express";
// import { ObjectId } from "mongodb";
import {
    ExtractJwt,
    Strategy as JwtStrategy,
    VerifiedCallback,
} from "passport-jwt";
import { JwtPayload } from "../types/types";

export const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME || "jwt";
export const PassportJwtStrategy = new JwtStrategy(
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
    async (req: Request, payload: JwtPayload, done: VerifiedCallback) => {
        try {
            console.log("여기는??");
            // Token 탈취여부 검사
            if (req.get("user-agent") !== payload.userAgent) {
                return done(null);
            }
            return done(null, payload);
        } catch (error) {
            return done(error);
        }
    }
);

export default [{ name: ACCESS_COOKIE_NAME, strategy: PassportJwtStrategy }];
