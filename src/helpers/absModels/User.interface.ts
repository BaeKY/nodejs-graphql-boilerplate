import { IsEmail, IsPhoneNumber } from "class-validator";
import { InterfaceType, Field } from "type-graphql";
import { Node, Timestamped, TimestampedNode } from "./Node.interface";
import bcrypt from "bcryptjs";
import { Prop } from "@typegoose/typegoose";

const SALT = parseInt(process.env.HASH_SALT || "12");

@InterfaceType({
    implements: [Node, Timestamped],
    description: "Default User Interface",
})
export abstract class IUser extends TimestampedNode {
    @Field(() => String)
    @Prop()
    name: string;

    @Field(() => String)
    @Prop()
    description?: string;

    @Field(() => String)
    @Prop()
    @IsEmail()
    email: string;

    @Field(() => String)
    @Prop()
    @IsPhoneNumber(null)
    phoneNumber: string;

    @Prop(() => String)
    password: string;

    async setPassword(password: string) {
        this.password = await bcrypt.hash(password, SALT);
    }

    async comparePassword(password: string) {
        return await bcrypt.compare(password, this.password);
    }
}
