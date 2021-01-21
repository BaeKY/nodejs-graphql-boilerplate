import { Field, InterfaceType } from "type-graphql";
import { Prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";

@InterfaceType({
    resolveType: (value) => value.constructor.name,
})
export abstract class BaseModel extends Base {
    @Prop()
    readonly createdAt: Date;

    @Prop()
    expiresAt?: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted?: boolean;
}

Field(() => ObjectId)(BaseModel.prototype, "_id");
Field(() => Date)(BaseModel.prototype, "createdAt");
Field(() => Date)(BaseModel.prototype, "updatedAt");
Field(() => Date, { nullable: true })(BaseModel.prototype, "expiresAt");
Field(() => Boolean, {
    defaultValue: false,
})(BaseModel.prototype, "isDeleted");
