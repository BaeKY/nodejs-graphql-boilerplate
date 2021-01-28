import { getModelForClass } from "@typegoose/typegoose";
import { Service } from "typedi";
import { User, UserCreateInput } from "./User.type";
import { BasicService } from "../Core/Core.service";
import { ClientSession } from "mongoose";
import { validate } from "class-validator";

export const UserModel = getModelForClass(User);

@Service()
export class UserService extends BasicService<User>(User, UserModel) {
    // Define custom functions
    async signUp(input: UserCreateInput, session?: ClientSession) {
        const user = Object.assign(new User(), {
            ...input,
        } as Partial<User>);
        await user.setPassword(input.password);
        const errors = await validate(user);
        if (errors.length) {
            throw errors;
        }
        const userDoc = new this.model(user);
        await userDoc.save({ session });
        return userDoc;
    }
}
