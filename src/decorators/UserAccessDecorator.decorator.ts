import { createMethodDecorator } from "type-graphql";
import { IContext } from "../types/context";
import { UserJWTPayload } from "../types/types";
import { jwtDecode } from "../utils/jwtUtils";

export const setUserToContext = (
    context: IContext,
    jwtCookieName: string,
    secret: string,
    field = "userPayload"
) => {
    const accessToken = context.req.signedCookies[jwtCookieName];
    if (accessToken) {
        const jwtPayload = jwtDecode<UserJWTPayload>(accessToken, secret);
        context[field] = jwtPayload;
    }
};

export function UserOnly(
    cookieName: string,
    jwtSecret: string,
    field = "userPayload"
) {
    return createMethodDecorator<IContext>(async ({ context }, next) => {
        setUserToContext(context, cookieName, jwtSecret, field);
        return next();
    });
}
