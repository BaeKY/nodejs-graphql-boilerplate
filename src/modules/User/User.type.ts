import { Prop } from "@typegoose/typegoose";
import { Field, InputType, ObjectType } from "type-graphql";
import { generateFilterType } from "../../helpers/decorators/filter/generateFilterType";
import { generateSortType } from "../../helpers/decorators/sort/generateSortType";
import { Node, Timestamped } from "../Core/Core.interface";
import { IUser, UserType } from "./User.interface";

@ObjectType({
    implements: [Node, Timestamped, IUser],
})
export class User extends IUser {
    @Field(() => UserType)
    @Prop({ required: true, enum: UserType, default: UserType.Normal })
    type: UserType;
}

@InputType()
export class UserCreateInput implements Partial<User> {
    @Field(() => String)
    email: string;

    @Field(() => String)
    phoneNumber: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    @Prop()
    password: string;
}

@InputType()
export class UserUpdateInput implements Partial<UserCreateInput> {
    @Field(() => String, { nullable: true })
    phoneNumber?: string;

    @Field(() => String, { nullable: true })
    name?: string;
}

export const _UserFilter = generateFilterType(User, Node, Timestamped, IUser);
export const _UserSorting = generateSortType(User, Node, Timestamped, IUser);
