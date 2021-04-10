import { ObjectType } from "type-graphql";
import { Node, Timestamped } from "../Core/Core.interface";
import { IFile } from "./File.interface";

@ObjectType({ implements: [Node, Timestamped, IFile] })
export class File extends IFile {}
