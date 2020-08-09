import { buildSchema } from "type-graphql";
import { TypegooseMiddleware } from "../middlewares/typegooseMiddleware";
import { ObjectId } from "mongodb";
import { ObjectIdScalar } from "../types/scalars/ObjectId.scalar";
import { authChecker } from "./authChecker";
import { GraphQLSchema } from "graphql";
import { ErrorInterceptor } from "../middlewares/loggingMiddleware";

export const createSchema = async (): Promise<GraphQLSchema> =>
    buildSchema({
        emitSchemaFile: true,
        resolvers: [
            __dirname + "/../**/*.{resolver,interface,model,type}.{ts,js}",
        ],
        globalMiddlewares: [TypegooseMiddleware, ErrorInterceptor],
        scalarsMap: [
            {
                type: ObjectId,
                scalar: ObjectIdScalar,
            },
        ],
        authChecker,
    });