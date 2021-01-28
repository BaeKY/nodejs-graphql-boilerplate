import { getModelForClass } from "@typegoose/typegoose";
import { Service } from "typedi";
import { BasicService } from "../Core/Core.service";
import { File } from "./File.model";

export const FileModel = getModelForClass(File);

@Service()
export class FileService extends BasicService(File, FileModel) {
    // TODO: 아직 인터페이스도 없다.
}
