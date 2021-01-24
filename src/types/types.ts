import { ContainerInstance } from "typedi";

export interface IContext {
    requestId: string;
    container: ContainerInstance;
}
