import { ExpressContext } from "apollo-server-express";
import { ClientSession } from "mongoose";
import { IUser, UserType } from "../modules/User/User.interface";

export interface IContext extends ExpressContext {
    // default => 9
    dateTimeOffsetHours: number;
    userPayload?: JwtPayload;
    session?: ClientSession;
}

export interface IContext {
    user?: IUser;
}

export interface JwtPayload {
    _id: string;
    email: string;
    userType: UserType;
    userAgent: string;
    offsetHours: number;
    timezone: string;
    clientHash: string;
}
