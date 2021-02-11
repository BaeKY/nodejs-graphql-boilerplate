import { ExpressContext } from "apollo-server-express";
import { ClientSession } from "mongoose";
import { IUser } from "../modules/User/User.interface";
import { UserJWTPayload } from "./types";

export interface IContext extends ExpressContext {
    // default => 9
    dateTimeOffsetHours: number;
    session?: ClientSession;

    // user info
    user?: IUser;
    // 세션에 담아서 사용함!
    userPayload?: UserJWTPayload;
}

export interface IContextUser extends IContext {
    user: IUser;
}
