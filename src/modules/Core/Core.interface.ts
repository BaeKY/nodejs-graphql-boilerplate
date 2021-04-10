import { Field, InterfaceType, ObjectType } from "type-graphql";
import { Prop } from "@typegoose/typegoose";
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";

@InterfaceType({
    description: "Default Node",
    resolveType: (value) => value.constructor.name,
})
export abstract class Node extends Base {
    constructor(args?: any) {
        super();
        if (args) {
            for (const key in args) {
                const element = args[key];
                this[key] = element;
            }
        }
    }

    @Prop()
    isDeleted?: boolean;
}
{
    Field(() => ObjectId)(Node.prototype, "_id");
}

@InterfaceType({
    description: "Timestamp type",
    resolveType: (value) => value.constructor.name,
})
export abstract class Timestamped extends Base implements TimeStamps {
    @Field(() => Date)
    @Prop()
    createdAt!: Date;

    @Field(() => Date)
    @Prop()
    updatedAt!: Date;
}

@ObjectType({
    isAbstract: true,
    implements: [Node, Timestamped],
})
export abstract class TimestampedNode extends Node implements Timestamped {
    @Field(() => Date)
    @Prop()
    readonly createdAt!: Date;

    @Field(() => Date)
    @Prop()
    updatedAt!: Date;
}
