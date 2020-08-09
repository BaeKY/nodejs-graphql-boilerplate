import { Field, InterfaceType } from "type-graphql";
import { prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";

@InterfaceType({
    resolveType: (value) => value.constructor.name,
})
export abstract class CollectionDataInterface extends Base {
    @prop()
    readonly createdAt: Date;

    @prop()
    expiresAt?: Date;

    @prop()
    updatedAt: Date;

    @prop()
    isDeleted?: boolean;
}

Field(() => ObjectId)(CollectionDataInterface.prototype, "_id");
Field(() => Date)(CollectionDataInterface.prototype, "createdAt");
Field(() => Date)(CollectionDataInterface.prototype, "updatedAt");
Field(() => Date, { nullable: true })(
    CollectionDataInterface.prototype,
    "expiresAt"
);
Field(() => Boolean, {
    defaultValue: false,
})(CollectionDataInterface.prototype, "isDeleted");
