import { ExpressContext } from "apollo-server-express";
import { ClientSession } from "mongoose";
import { UserType } from "../modules/User/User.interface";
import { User } from "../modules/User/User.type";

export interface IContext extends ExpressContext {
    // default => 9
    dateTimeOffsetHours: number;
    userPayload?: JwtPayload;
    session?: ClientSession;
}

export interface IContext {
    user?: User;
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
