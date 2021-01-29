import { getModelForClass } from "@typegoose/typegoose";
import { Service } from "typedi";
import { User, UserCreateInput } from "./User.type";
import { BasicService } from "../Core/Core.service";
import { validate } from "class-validator";
import { IContext, JwtPayload } from "../../types/types";
import { accessTokenGenerate, accessTokenVerify } from "../../utils/jwtUtils";
import { ACCESS_COOKIE_NAME } from "../../passport/strategies";
import { UserType } from "./User.interface";

export const UserModel = getModelForClass(User, {
    schemaOptions: {
        timestamps: true,
    },
});

@Service()
export class UserService extends BasicService<User>(User, UserModel) {
    // Define custom functions
    public async saveUser(context: IContext, input: UserCreateInput) {
        const user = new User(input);
        await user.setPassword(input.password);
        const errors = await validate(user);
        if (errors.length) {
            throw errors;
        }
        const userDoc = new this.model(user);
        await userDoc.save({ session: context.session });
        return userDoc;
    }

    public async findByEmail(email: string, userType: UserType) {
        return this.model.findOne({ email, type: userType });
    }

    public async comparePassword(user: User | null, password: string) {
        if (!user) {
            return false;
        }
        return user.comparePassword(password);
    }

    public async removeAccessToken(context: IContext): Promise<boolean> {
        context.res.clearCookie(ACCESS_COOKIE_NAME);
        // TODO: Token 블랙리스트 등록!
        return true;
    }

    public accessTokenVerify(context: IContext): JwtPayload {
        const decoded = accessTokenVerify(
            context.req.signedCookies[ACCESS_COOKIE_NAME]
        );
        return decoded as any;
    }

    public accessTokenPublish(context: IContext, user: User) {
        const token = accessTokenGenerate(user, context.req);
        context.res.cookie(ACCESS_COOKIE_NAME, token, {
            httpOnly: true,
            signed: true,
        });
    }
}
