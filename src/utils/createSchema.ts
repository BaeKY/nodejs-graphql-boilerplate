import { buildSchema } from "type-graphql";
import { ObjectIdScalar } from "../types/scalars/ObjectId.scalar";
import { authChecker } from "./authChecker";
import { GraphQLSchema } from "graphql";
import { JSONObjectResolver } from "graphql-scalars";
import { ErrorLoggerMiddleware } from "../middlewares/errorLogging";
import { ObjectId } from "mongodb";
import { TypegooseMiddleware } from "../middlewares/typegoose-middleware";
import Container from "typedi";
import { join } from "path";

const resolverPaths = join(
    __dirname,
    "/../**/*.{resolver,interface,model,type}.{ts,js}"
);

export const createSchema = async (): Promise<GraphQLSchema> =>
    buildSchema({
        emitSchemaFile: true,
        resolvers: [resolverPaths],
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
        container: Container,
    });
