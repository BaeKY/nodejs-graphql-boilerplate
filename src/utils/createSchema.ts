import { buildSchema, ResolverData } from "type-graphql";
import { ObjectIdScalar } from "../types/scalars/ObjectId.scalar";
import { authChecker } from "./authChecker";
import { GraphQLSchema } from "graphql";
import { IContext } from "../types/types";
import { JSONObjectResolver } from "graphql-scalars";
import { ErrorLoggerMiddleware } from "../middlewares/errorLogging";
import { ObjectId } from "mongodb";
import { TypegooseMiddleware } from "../middlewares/typegoose-middleware";

export const createSchema = async (): Promise<GraphQLSchema> =>
    buildSchema({
        emitSchemaFile: true,
        resolvers: [
            __dirname + "/../**/*.{resolver,interface,model,type}.{ts,js}",
        ],
        globalMiddlewares: [TypegooseMiddleware, ErrorLoggerMiddleware],
        scalarsMap: [
            {
                type: ObjectId,
                scalar: ObjectIdScalar,
            },
            {
                type: () => JSON,
                scalar: JSONObjectResolver,
            },
        ],
        authChecker,
        container: ({ context }: ResolverData<IContext>) => context.container,
    });
