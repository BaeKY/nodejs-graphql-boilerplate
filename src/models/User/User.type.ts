import { ObjectType, Field, registerEnumType } from "type-graphql";
import { CollectionDataInterface } from "../../helpers/CollectionData.type";
import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { IsEmail, IsPhoneNumber, IsPostalCode } from "class-validator";
import { StringFilter } from "../../helpers/decorators/FilterInputGen/FilterInputGenDecorator";
import { ObjectId } from "mongodb";
import { Zoneinfo } from "../../api/Commons/Zoneinfo/Zoneinfo.type";
import { createHash } from "crypto";

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

    @prop({ _id: false })
    @Field(() => Zoneinfo)
    zoneinfo: Zoneinfo;

    @prop({ default: () => false })
    @Field(() => Boolean)
    isVerifiedPhoneNumber: boolean;

    @prop({ default: () => false })
    @Field(() => Boolean)
    isVerifiedEmail: boolean;

    @Field()
    @prop()
    @IsPhoneNumber(null)
    phoneNumber: string;

    @Field(() => UserRole)
    @prop()
    @StringFilter(["in", "not_in", "eq", "not_eq"], () => UserRole)
    role: UserRole;

    @prop({ default: [] })
    studentIds: ObjectId[];

    @prop()
    password: string;

    /**
     * ! 이하 함수들
     */
    setTimezone(input?: {
        name: string;
        offset: number;
        callingCode: string;
        alpha2Code: string;
    }) {
        const zoneinfo = new Zoneinfo();
        if (!input) {
            zoneinfo.timezone = "Asia/Seoul";
            zoneinfo.offset = 9;
            zoneinfo.callingCode = "+82";
            zoneinfo.alpha2Code = "KR";
        } else {
            zoneinfo.timezone = input.name;
            zoneinfo.offset = input.offset;
            zoneinfo.callingCode = input.callingCode;
            zoneinfo.alpha2Code = input.alpha2Code;
        }
        this.zoneinfo = zoneinfo;
    }

    verifyPhoneNumber() {
        this.isVerifiedPhoneNumber = true;
    }

    verifyEmail() {
        this.isVerifiedEmail = true;
    }

    hashPassword() {
        this.password = this.hash(this.password);
    }

    comparePassword(password: string): boolean {
        return this.password === this.hash(password);
    }

    private hash(password: string) {
        return createHash("sha512").update(password).digest("hex");
    }
}

export const UserModel = getModelForClass(User);

registerEnumType(UserRole, {
    name: "UserRole",
    description: "유저 역할!",
});
