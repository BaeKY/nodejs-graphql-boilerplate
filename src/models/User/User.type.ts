import { ObjectType, Field, registerEnumType } from "type-graphql";
import { CollectionDataInterface } from "../../helpers/CollectionData.type";
import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { IsEmail, IsPhoneNumber, IsPostalCode } from "class-validator";
import { StringFilter } from "../../helpers/decorators/FilterInputGen/FilterInputGenDecorator";
import { ObjectId } from "mongodb";

export enum UserRole {
    TEACHER,
    STUDENT,
    SUPERADMIN,
    ADMIN,
}

@ObjectType({
    implements: CollectionDataInterface,
})
@modelOptions({
    schemaOptions: {
        timestamps: true,
        collection: "User",
    },
})
export class User extends CollectionDataInterface {
    @Field()
    @prop()
    @StringFilter(
        [
            "contains",
            "not_contains",
            "in",
            "not_in",
            "start_with",
            "not_start_with",
            "end_with",
            "not_end_with",
        ],
        () => String
    )
    name: string;

    @Field()
    @prop()
    @IsEmail()
    email: string;

    @Field(() => String, { defaultValue: "KR" })
    @prop()
    @IsPostalCode()
    countryCode2: string;

    @Field()
    @prop()
    @IsPhoneNumber(this.countryCode2)
    phoneNumber: string;

    @Field(() => UserRole)
    @prop()
    @StringFilter(["in", "not_in", "eq", "not_eq"], () => UserRole)
    role: UserRole;

    @prop({ default: [] })
    studentIds: ObjectId[];

    // @Field(() => [String])
    // @prop()
    // permissions: string[];
}

export const UserModel = getModelForClass(User);

registerEnumType(UserRole, {
    name: "UserRole",
    description: "유저 역할!",
});
