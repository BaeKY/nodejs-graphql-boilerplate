import jwt from "jsonwebtoken";
import { IUser } from "../modules/User/User.interface";
import { JwtPayload } from "../types/types";
import { IContext } from "../types/context";

export const accessTokenPublish = (
    user: IUser,
    context: IContext,
    cookieName: string
) => {
    const token = accessTokenGenerate(
        user,
        context.req.get("user-agent") || ""
    );
    context.res.cookie(cookieName, token, {
        httpOnly: true,
        signed: true,
    });
};
export const removeAccessToken = async (
    context: IContext,
    tokenName: string
): Promise<boolean> => {
    context.res.clearCookie(tokenName);
    // TODO: Token 블랙리스트 등록!
    return true;
};

export const accessTokenGenerate = (
    user: IUser,
    userAgent: string,
    secret = process.env.JWT_SECRET || ""
) => {
    const token = jwt.sign(
        {
            _id: user._id.toHexString(),
            email: user.email,
            userType: user.type,
            timezone: user.timezone,
            userAgent,
            offsetHours: 9,
        } as JwtPayload,
        secret
    );
    return token;
};

export const accessTokenVerify = <T = any>(
    token: string,
    secret = process.env.JWT_SECRET || ""
): T => {
    return jwt.verify(token, secret) as any;
};
