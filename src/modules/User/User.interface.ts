import {
    InterfaceType,
    Field,
    registerEnumType,
    InputType,
    Float,
} from "type-graphql";
import bcrypt from "bcryptjs";
import { Prop } from "@typegoose/typegoose";
import { Node, Timestamped, TimestampedNode } from "../Core/Core.interface";

const BCRYPT_HASH_SALT = parseInt(process.env.HASH_SALT || "12");

export enum UserType {
    Admin = 0,
    Normal = 1,
}

registerEnumType(UserType, {
    name: "UserType",
});

@InterfaceType({
    implements: [Node, Timestamped],
    description: "Basic User Interface",
})
export class IUser extends TimestampedNode {
    @Field(() => String)
    @Prop({ required: true })
    name: string;

    @Field(() => UserType)
    @Prop({ required: true, enum: UserType })
    type: UserType;

    @Field(() => String)
    @Prop({ required: true })
    email: string;

    @Field(() => String)
    @Prop()
    phoneNumber: string;

    @Field(() => String, { defaultValue: "Asia/Seoul" })
    @Prop({ defualt: "Asia/Seoul" })
    timezone: string;

    @Field(() => Float, { defaultValue: 9 })
    @Prop({ default: 9 })
    offsetHour: number;

    @Prop(() => String)
    private password: string;

    async setPassword(password: string) {
        this.password = await bcrypt.hash(password, BCRYPT_HASH_SALT);
    }

    async comparePassword(password: string) {
        return await bcrypt.compare(password, this.password);
    }
}
@InterfaceType("IAdminUser", {
    implements: [IUser, Node, Timestamped],
})
export abstract class AbsAdminUser extends IUser {
    constructor(args?: any) {
        super(args);
    }

    // TODO: 뭐가 들어가야할지 고민좀 해보자
    // Permission 같은것들을 넣어야 할까?
    @Field(() => UserType)
    @Prop({ enum: UserType })
    type: UserType = UserType.Admin;
}

@InputType({
    isAbstract: true,
})
export class IUserCreateInput {
    @Field(() => String)
    name: string;

    @Field(() => String)
    email: string;

    @Field(() => String)
    password: string;
}

@InputType({
    isAbstract: true,
})
export class IUserUpdateInput {
    @Field(() => String, { nullable: true })
    name?: string;
}

@InputType()
export class UserSignInInput {
    @Field(() => String)
    email: string;

    @Field(() => String)
    password: string;
}
