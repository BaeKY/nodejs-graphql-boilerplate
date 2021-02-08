import { UserType } from "../modules/User/User.interface";

export interface UserJWTPayload {
    _id: string;
    email: string;
    userType: UserType;
    userAgent: string;
    offsetHours: number;
    timezone: string;
    clientHash: string;
}
