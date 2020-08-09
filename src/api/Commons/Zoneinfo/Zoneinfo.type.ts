import { ObjectType, Field, Int } from "type-graphql";
import { Hour } from "types";

@ObjectType()
export class Zoneinfo {
    @Field(() => String)
    name: string;

    @Field(() => String)
    code: string;

    @Field(() => String)
    timezone: string;

    @Field(() => Int)
    offset: Hour;

    @Field(() => String)
    callingCode: string;
}
