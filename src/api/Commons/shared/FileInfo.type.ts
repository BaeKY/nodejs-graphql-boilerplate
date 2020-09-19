import { prop } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { ObjectType, Field, InputType } from "type-graphql";
import { File } from "../../../models/File/File.type";
import { FileUpload, GqlUpload } from "../../../types/scalars/Upload.scalar";
import { formatDate } from "../../../utils/dateUtils";
import { uploadToS3 } from "../../../utils/s3Functions";

@ObjectType("Tag", {
    description: "태그.. ㅜㅜ",
})
export class GqlTag {
    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }

    @Field(() => String)
    @prop()
    key: string;

    @Field(() => String)
    @prop()
    value: string;
}

@InputType()
export class GqlTagInput {
    @Field(() => String)
    key: string;

    @Field(() => String)
    value: string;
}

@InputType({
    description: "File upload to s3",
})
export class FileInput {
    @Field(() => GqlUpload)
    upload: Promise<FileUpload>;

    @Field(() => [GqlTagInput], {
        defaultValue: [],
    })
    tags: GqlTagInput[];

    async s3Upload(ownerId: ObjectId, date?: Date): Promise<File | undefined> {
        const upload = await this.upload;
        try {
            const uploadResult = await uploadToS3(upload, {
                // TODO: 파일 이름 앞에 prefix를 붙여서 중복검사를 할 필요 없게 만들자..
                filename: `${ownerId.toHexString()}/${formatDate(
                    date || new Date(),
                    "%y%m%d-%hh/%im%ss"
                )}/${upload.filename}`,
                tagSet: this.tags.map((tag) => ({
                    Key: tag.key,
                    Value: tag.value,
                })),
            });

            const file = new File();
            file.uri = uploadResult.Location;
            file.name = upload.filename;
            file.extension = upload.filename.split(".").pop() || "";
            file.ownerId = ownerId;
            file.mTag = new Map<string, any>();
            this.tags.forEach((tag) => {
                file.mTag.set(tag.key, tag.value);
            });
            return file;
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }
}
