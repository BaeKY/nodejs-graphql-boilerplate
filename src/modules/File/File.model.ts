import { Prop } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { Tag, OptionsForPropMap } from "../Common/Tag.type";
import { Node, Timestamped } from "../Core/Core.interface";
import { AbsFile } from "./File.interface";

@ObjectType({ implements: [Node, Timestamped, AbsFile] })
export class File extends AbsFile {
    @Field(() => [Tag])
    @Prop(OptionsForPropMap)
    tags: Tag[];
}
