import { InterfaceType, Field } from "type-graphql";
import { Prop } from "@typegoose/typegoose";
import { IsUrl } from "class-validator";
import { FileUpload } from "../../types/scalars/Upload.scalar";
import { S3 } from "aws-sdk";
import { Node, Timestamped, TimestampedNode } from "../Core/Core.interface";
import { OptionsForPropMap, Tag } from "../Common/Tag.type";

export interface IFile {
    s3Key: string;
    filename: string;
    extension: string;
    url: string;
    tags?: Tag[];
    uploadToS3(
        file: Promise<FileUpload>,
        options?: {
            filename?: string;
            tagSets: S3.Tag[];
        }
    ): Promise<string>;
    deleteOnS3(): Promise<boolean>;
}

@InterfaceType("IFile", {
    implements: [Node, Timestamped],
    description: "Default File Interface",
})
export abstract class IFile extends TimestampedNode {
    @Field(() => String)
    @Prop()
    s3Key!: string;

    /**
     * 파일이름 중복은 알아서 처리 ㄱ
     * @param file
     * @param options
     * @returns
     */
    async uploadToS3(
        file: Promise<FileUpload>,
        options?: {
            filename?: string;
            tagSets?: S3.Tag[];
        }
    ): Promise<string> {
        const { filename, tagSets } = options || {};
        const upload = await file;

        const t = await new S3.ManagedUpload({
            params: {
                ACL: "public-read",
                Bucket: process.env.AWS_BUCKETNAME || "",
                Body: upload.createReadStream(),
                Key: filename || upload.filename,
            },
            tags: tagSets,
        }).promise();
        return t.Location;
    }

    async deleteOnS3(): Promise<boolean> {
        const result = await new S3()
            .deleteObject({
                Bucket: process.env.AWS_BUCKETNAME || "",
                Key: this.s3Key,
            })
            .promise();
        return !result.DeleteMarker;
    }

    @Field(() => String)
    @Prop()
    filename!: string;

    @Field(() => String)
    @Prop()
    extension!: string;

    @Field(() => String)
    @Prop()
    @IsUrl()
    url!: string;

    @Field(() => [Tag], { nullable: true })
    @Prop(OptionsForPropMap)
    tags?: Tag[];
}
