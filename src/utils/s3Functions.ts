import { S3 } from "aws-sdk";
import { FileUpload } from "../types/scalars/Upload.scalar";

export const uploadToS3 = async (
    upload: FileUpload,
    {
        filename,
        tagSet,
    }: {
        filename?: string;
        tagSet?: { Key: string; Value: string }[];
    }
) => {
    // TODO: 여기서 업로드 하기 ㅎㅎ
    const tags = [
        {
            Key: "mimetype",
            Value: upload.mimetype,
        },
        {
            Key: "filename",
            Value: upload.filename,
        },
        ...(tagSet ? tagSet : []),
    ];
    return new S3.ManagedUpload({
        params: {
            ACL: "public-read",
            Bucket: process.env.AWS_BUCKETNAME || "",
            Body: upload.createReadStream(),
            Key: filename || upload.filename,
        },
        tags,
    }).promise();
};

export const getFileType = (filename: string) => {
    const extension = filename.split(".").pop() || "";
    if (FILE_TYPE.AUDIO.includes(extension)) {
        return "AUDIO";
    } else if (FILE_TYPE.IMAGE.includes(extension)) {
        return "IMAGE";
    } else if (FILE_TYPE.VIDEO.includes(extension)) {
        return "VIDEO";
    } else if (FILE_TYPE.DOCUMENT.includes(extension)) {
        return "DOCUMENT";
    } else {
        return undefined;
    }
};
export const FILE_TYPE = {
    AUDIO: ["mp3", "wav", "wma"],
    IMAGE: ["png", "jpg", "jpeg"],
    VIDEO: ["mp4"],
    DOCUMENT: ["pdf"],
};
