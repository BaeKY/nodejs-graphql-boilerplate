import { ObjectType, Field, InputType } from "type-graphql";
import { FileUpload, GqlUpload } from "../../../types/scalars/Upload.scalar";

@ObjectType({
    description: "S3 업로드된 파일...",
})
export class FileInfo {
    @Field(() => String)
    url: string;

    @Field(() => [Tag])
    tags: Tag[]; // name, mimetype, description 등의 태그 포함. metadata 역할을 함
}

@ObjectType({
    description: "태그.. ㅜㅜ",
})
export class Tag {
    @Field(() => String)
    key: string;

    @Field(() => String)
    value: string;
}

@InputType()
export class TagInput {
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

    @Field(() => [TagInput], {
        defaultValue: [],
        description: "S3파일에 적용되는 태그",
    })
    tags: TagInput[];
}
