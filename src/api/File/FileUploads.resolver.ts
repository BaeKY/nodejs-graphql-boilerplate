import { Resolver, Mutation, Arg, Ctx, Authorized } from "type-graphql";
import { GenerateArrayReturnResponse } from "../../helpers/BaseResponse.type";
import { File, FileModel } from "../../models/File/File.type";
import { mongoose } from "@typegoose/typegoose";
import { FileInput } from "../Commons/shared/FileInfo.type";
import { Context } from "../../types/types";
import { UserRole } from "../../models/User/User.type";
import {
    ERROR_USER_ID_UNDEFINED,
    validateClass,
} from "../../helpers/errorHandling";

const FileUploadsResponse = GenerateArrayReturnResponse(File, "FileUploads");
type FileUploadsResponse = InstanceType<typeof FileUploadsResponse>;

@Resolver()
export class FileUploadsResolver {
    @Authorized(UserRole.SUPERADMIN)
    @Mutation(() => FileUploadsResponse)
    async FileUploads(
        @Ctx() context: Context,
        @Arg("files", () => [FileInput]) uploadInputs: FileInput[]
    ): Promise<FileUploadsResponse> {
        const response = new FileUploadsResponse();

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = context.user;
            if (!user) {
                throw ERROR_USER_ID_UNDEFINED;
            }
            const date = new Date();
            const files = await Promise.all(
                uploadInputs.map((i) => i.s3Upload(user._id, date))
            );
            const fileInstances = await Promise.all(
                files.map(async (f) => {
                    await validateClass(f);
                    return new FileModel(f);
                })
            );
            const result = await Promise.all(
                fileInstances.map(async (f) => f.save({ session }))
            );
            response.setData(result.map((r) => r.toObject()));
            await session.commitTransaction();
        } catch (error) {
            response.setError(error);
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
        return response;
    }
}
