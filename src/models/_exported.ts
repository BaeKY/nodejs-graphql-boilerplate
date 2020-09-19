import "reflect-metadata";
import { FileModel } from "./File/File.type";
import { UserModel } from "./User/User.type";
// DB에 정의해야 하는 Schema 클래스들 목록을 집어넣는다.
export default [UserModel, FileModel] as any[];
