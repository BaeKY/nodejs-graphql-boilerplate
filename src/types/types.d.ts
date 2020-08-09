import { User } from "../models/User/User.type";

export type UserDecodeByJwt = {
    _id: string;
    name: string;
    updatedAt: string;
    timezone: string;
    email: string;
    profileImg: string;
    phoneNumber: string;
    callingCode: string;
};

export type Hour = number;
export type Minute = number;
export type Seconds = number;

export type Context = {
    user: User;
    res: any;
    req: any;
};
