import jwt from "jsonwebtoken";
import { IUser } from "../modules/User/User.interface";
import { UserJWTPayload } from "../types/types";

export const jwtEncode = (
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
        } as UserJWTPayload,
        secret
    );
    return token;
};

export const jwtDecode = <T = any>(
    token: string,
    secret = process.env.JWT_SECRET || ""
): T => {
    return jwt.verify(token, secret) as any;
};
