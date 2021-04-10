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
import { Filter } from "../../helpers/decorators/filter/filter";
import { Sorting } from "../../helpers/decorators/sort/SortDecorator";

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
    @Filter(["contains", "not_contains"], () => String)
    name!: string;

    @Field(() => UserType)
    @Prop({ required: true, enum: UserType })
    type!: UserType;

    @Field(() => String)
    @Prop({ required: true })
    @Filter(["contains", "not_contains", "in", "not_in"], () => String)
    email!: string;

    @Field(() => String)
    @Prop()
    @Filter(["contains", "not_contains", "in", "not_in"], () => String)
    phoneNumber!: string;

    @Field(() => String, { defaultValue: "Asia/Seoul" })
    @Prop({ defualt: "Asia/Seoul" })
    @Filter(["contains", "not_contains", "in", "not_in"], () => String)
    timezone!: string;

    @Field(() => Float, { defaultValue: 9 })
    @Prop({ default: 9 })
    @Filter(["in", "not_in", "gte", "lte", "gt", "lt"], () => Float)
    @Sorting()
    offsetHour!: number;

    @Prop({ required: false })
    private password?: string;

    async setPassword(password: string) {
        this.password = await bcrypt.hash(password, BCRYPT_HASH_SALT);
    }

    async comparePassword(password: string) {
        return this.password != null && await bcrypt.compare(password, this.password);
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
    name!: string;

    @Field(() => String)
    email!: string;

    @Field(() => String)
    password!: string;
}

@InputType({
    isAbstract: true,
})
export class IUserUpdateInput {
    @Field(() => String, { nullable: true })
    name?: string;
}
