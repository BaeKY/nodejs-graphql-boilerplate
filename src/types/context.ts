import { ExpressContext } from "apollo-server-express";
import { ClientSession } from "mongoose";
import { IUser } from "../modules/User/User.interface";
import { UserJWTPayload } from "./types";

export interface IContext extends ExpressContext {
    // default => 9
    dateTimeOffsetHours: number;
    userPayload?: UserJWTPayload;
    session?: ClientSession;
}

export interface IContext {
    user?: IUser;
}
