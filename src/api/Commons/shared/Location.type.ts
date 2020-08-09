import { ObjectType, Field, Float } from "type-graphql";

@ObjectType()
export class Location {
    @Field(() => String)
    address: string;

    @Field(() => String, { nullable: true })
    addressDetail?: string;

    @Field(() => Float)
    lat: number;

    @Field(() => Float)
    lng: number;
}
