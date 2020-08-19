import { ObjectType, Field, Float } from "type-graphql";
import { Hour } from "../../../types/types";
import { prop } from "@typegoose/typegoose";

@ObjectType()
export class Zoneinfo {
    @Field(() => String)
    @prop({ default: "Asia/Seoul" })
    timezone: string;

    @Field(() => Float)
    @prop({ default: 9 })
    offset: Hour;

    @Field(() => String)
    @prop({ default: "+82" })
    callingCode: string;

    @Field(() => String)
    @prop({ default: "KR" })
    alpha2Code: string;
}
