import { getDiscriminatorModelForClass } from "@typegoose/typegoose";
import { GraphQLUpload } from "graphql-upload";
import { Field, InputType, ObjectType } from "type-graphql";
import { FileUpload } from "../../types/scalars/Upload.scalar";
import { Tag } from "../Common/Tag.type";
import { Node, Timestamped } from "../Core/Core.interface";
import { IFile } from "./File.interface";
import { FileModel } from "./File.service";

@ObjectType({ implements: [Node, Timestamped, IFile] })
export class Image extends IFile {}

@ObjectType({ implements: [Node, Timestamped, IFile] })
export class Audio extends IFile {}

@InputType()
export class FileUploadInput {
    @Field(() => GraphQLUpload)
    upload!: Promise<FileUpload>;

    @Field(() => [Tag], { nullable: true })
    tags?: Tag[];
}

export const ImsgeModel = getDiscriminatorModelForClass(FileModel, Image);

export const AudioModel = getDiscriminatorModelForClass(FileModel, Audio);
