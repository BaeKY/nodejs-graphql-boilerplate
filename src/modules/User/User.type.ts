import { Prop } from "@typegoose/typegoose";
import { Field, InputType, ObjectType } from "type-graphql";
import { generateFilterType } from "../../helpers/decorators/filter/generateFilterType";
import { generateSortType } from "../../helpers/decorators/sort/generateSortType";
import {
    MutationPayload,
    MutationPayloadArr,
} from "../Common/MutationPayload.type";
import { Node, Timestamped } from "../Core/Core.interface";
import { AbsUser } from "./User.interface";

@ObjectType({
    implements: [Node, Timestamped, AbsUser],
})
export class User extends AbsUser {}

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

export const _UserFilter = generateFilterType(User, Node, Timestamped, AbsUser);
export const _UserSorting = generateSortType(User, Node, Timestamped, AbsUser);

export const UserMutationPayload = MutationPayload(User, "User");
export type UserMutationPayload = InstanceType<typeof UserMutationPayload>;

export const UserListMutationPayload = MutationPayloadArr(User, "UserSignUp");
export type UserListMutationPayload = InstanceType<
    typeof UserListMutationPayload
>;
