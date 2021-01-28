import { ClientSession } from "mongoose";
import { User } from "../modules/User/User.type";

export interface IContext {
    // default => 9
    dateTimeOffsetHours: number;
    session?: ClientSession;
    req: any;
    res: any;
}

export interface IContext {
    user?: User;
}
