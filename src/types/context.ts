import { ExpressContext } from "apollo-server-express";
import { ClientSession } from "mongoose";
import { IUser } from "../modules/User/User.interface";
import { JwtPayload } from "./types";

export interface IContext extends ExpressContext {
    // default => 9
    dateTimeOffsetHours: number;
    userPayload?: JwtPayload;
    session?: ClientSession;
}

export interface IContext {
    user?: IUser;
}
