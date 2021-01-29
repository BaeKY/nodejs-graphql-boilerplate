import jwt from "jsonwebtoken";
import { User } from "../modules/User/User.type";
import { JwtPayload } from "../types/types";

export const accessTokenGenerate = (user: User, req: any) => {
    const token = jwt.sign(
        {
            _id: user._id.toHexString(),
            email: user.email,
            userType: user.type,
            timezone: "Asia/Seoul",
            userAgent: req.get("user-agent"),
            offsetHours: 9,
            clientHash: "HelloWorld",
        } as JwtPayload,
        process.env.JWT_SECRET || ""
    );
    return token;
};

export const accessTokenVerify = <T = any>(token: string): T => {
    return jwt.verify(token, process.env.JWT_SECRET || "") as any;
};
