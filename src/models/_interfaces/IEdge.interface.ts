import { Field, InterfaceType } from "type-graphql";
import { ObjectId } from "mongodb";

@InterfaceType({
    description: "Edge for Schemas",
    resolveType: (value) => value.constructor.name,
})
export abstract class IEdgeData {
    @Field(() => ObjectId)
    readonly _id: ObjectId;

    @Field(() => Date)
    readonly createdAt: Date;

    @Field(() => Date, { nullable: true })
    expiresAt?: Date;

    @Field(() => Date)
    updatedAt: Date;
}
