import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { IsDefined, IsUrl } from "class-validator";
import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";
import { GqlTag } from "../../api/Commons/shared/FileInfo.type";
import { CollectionDataInterface } from "../../helpers/CollectionData.type";
import { PROP_OPT_FOR_MAP } from "../../helpers/mongoSchemaConstants";
import { mapToArr } from "../../utils/objectUtils";
import { getFileType } from "../../utils/s3Functions";
import { User, UserModel } from "../User/User.type";

@ObjectType({
    description: "S3 업로드된 파일...",
    implements: CollectionDataInterface,
})
@modelOptions({
    schemaOptions: {
        timestamps: true,
        collection: "File",
    },
    options: {
        allowMixed: 0,
    },
})
export class File extends CollectionDataInterface {
    constructor() {
        super();
    }
    @Field(() => String)
    @prop()
    name: string;

    @Field(() => String, { nullable: true })
    @prop()
    description?: string;

    @Field(() => String)
    @prop()
    extension: string; // 파일 확장자(lower case & "." 포함 안함)

    @Field(() => String)
    fileType = () => getFileType(this.extension);

    @Field(() => String)
    @prop()
    @IsUrl()
    uri: string;

    @Field(() => [GqlTag])
    get tags(): GqlTag[] {
        return mapToArr(this.mTag);
    }

    @Field(() => User)
    async owner() {
        return UserModel.findById(this.ownerId);
    }

    @prop()
    @IsDefined()
    ownerId: ObjectId;

    @prop(PROP_OPT_FOR_MAP)
    @IsDefined()
    mTag: Map<string, any>;
}

export const FileModel = getModelForClass(File);
