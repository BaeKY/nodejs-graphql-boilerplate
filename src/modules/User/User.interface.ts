import { InterfaceType, Field, registerEnumType } from "type-graphql";
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

@InterfaceType("IUser", {
    implements: [Node, Timestamped],
    description: "Default User Interface",
})
export abstract class AbsUser extends TimestampedNode {
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
    implements: [AbsUser, Node, Timestamped],
})
export abstract class AbsAdminUser extends AbsUser {
    constructor(args?: any) {
        super(args);
    }

    // TODO: 뭐가 들어가야할지 고민좀 해보자
    // Permission 같은것들을 넣어야 할까?
    @Field(() => UserType)
    @Prop({ enum: UserType })
    type: UserType = UserType.Admin;
}
