import { getModelForClass } from "@typegoose/typegoose";
import { Service } from "typedi";
import { BasicService } from "../Core/Core.service";
import { FileUploadInput } from "./File.type";
import { File } from "./File.model";

export const FileModel = getModelForClass(File);

@Service()
export class FileService extends BasicService(File, FileModel, {
    createInput: FileUploadInput,
}) {}
