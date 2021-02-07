import {
    DocumentType,
    getModelForClass,
    ReturnModelType,
} from "@typegoose/typegoose";
import { User } from "./User.type";
import { BasicService } from "../Core/Core.service";
import { validate } from "class-validator";
import { accessTokenGenerate } from "../../utils/jwtUtils";
import {
    IUser,
    IUserCreateInput,
    IUserUpdateInput,
    UserSignInInput,
} from "./User.interface";
import { ClassType } from "type-graphql";
import { ClientSession } from "mongoose";
import { JWT_USER_COOKIE_NAME } from "../../constants";

export const UserModel = getModelForClass(User, {
    schemaOptions: {
        timestamps: true,
    },
});

export const BasicUserService = <
    T extends IUser,
    CI_T extends IUserCreateInput,
    UI_T extends IUserUpdateInput
>(
    model: ReturnModelType<typeof types.cls>,
    types: {
        cls: ClassType<T>;
        createInput: ClassType<CI_T>;
        updateInput: ClassType<UI_T>;
    },
    jwtSecret: string
) => {
    class BasicClass extends BasicService(types.cls, model, {
        createInput: types.createInput,
        updateInput: types.updateInput,
    }) {
        async createUserOrErr(
            input: CI_T,
            session?: ClientSession
        ): Promise<DocumentType<T>> {
            return this.create(input, session, async (instance) => {
                await instance.setPassword(input.password);
                await validate(instance);
            });
        }

        async findByEmail(email: string): Promise<DocumentType<T> | null> {
            return this.model.findOne({ email } as any);
        }

        async findUserByEmailAndPasswordOrError(
            input: UserSignInInput
        ): Promise<DocumentType<T>> {
            const user = await this.findByEmail(input.email);
            if (!user) {
                throw Error(
                    "Incorrect password or Unexist User. Please check your id/pw"
                );
            }
            const passwordCompareResult = await user.comparePassword(
                input.password
            );
            if (passwordCompareResult) {
                throw Error(
                    "Incorrect password or Unexist User. Please check your id/pw"
                );
            }
            return user;
        }

        public accessTokenGenerate(user: IUser, userAgent: string) {
            return accessTokenGenerate(user, userAgent, jwtSecret);
        }
    }
    return BasicClass;
};

export const IUserService = BasicUserService(
    UserModel,
    {
        cls: IUser,
        createInput: IUserCreateInput,
        updateInput: IUserUpdateInput,
    },
    JWT_USER_COOKIE_NAME
);

export type IUserService = InstanceType<typeof IUserService>;
