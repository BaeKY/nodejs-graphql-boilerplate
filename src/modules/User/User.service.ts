import {
    DocumentType,
    getModelForClass,
    ReturnModelType,
} from "@typegoose/typegoose";
import { User, UserSignInInput } from "./User.type";
import { BasicService } from "../Core/Core.service";
import { jwtEncode } from "../../utils/jwtUtils";
import { IUser, IUserCreateInput, IUserUpdateInput } from "./User.interface";
import { ClassType } from "type-graphql";
import { ClientSession } from "mongoose";
import { validateOrError } from "../../helpers/validator/validateOrError";

export const UserModel = getModelForClass(User, {
    schemaOptions: {
        timestamps: true,
    },
});

/**
 * For extending User API.
 *  ex) export class TeacherService extends BasicUserService(
 *      TeacherModel,
 *      tyeps: {
 *          cls: Teacher,
 *          createInput: TeacherCreateInput,
 *          updateInput: TeacherUpdateInput
 *      },
 *      process.env.JWT_SECRET_TEACHER
 *  ) { INPUT YOUR CLASS LOGICS }
 * @param model extends IUserModel
 * @param types extends IUser
 * @param jwtSecret for jwt secret
 */
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
                await validateOrError(instance);
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

        public jwtEncode(user: IUser, userAgent: string) {
            return jwtEncode(user, userAgent, jwtSecret);
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
    process.env.JWT_SECRET || ""
);

export type IUserService = InstanceType<typeof IUserService>;
