import { graphql, GraphQLSchema } from "graphql";

import { createSchema } from "../utils/createSchema";
import { Maybe } from "type-graphql";
import { UserModel } from "../models/User/User.type";
import { ObjectId } from "mongodb";

interface Options {
    source: string;
    variableValues?: Maybe<{
        [key: string]: any;
    }>;
    userId?: ObjectId | string;
}

let schema: GraphQLSchema;

export const gCall = async ({ source, variableValues, userId }: Options) => {
    if (!schema) {
        schema = await createSchema();
    }
    return graphql({
        schema,
        source,
        variableValues,
        contextValue: {
            req: {
                headers: {
                    "x-forwarded-for": "127.0.0.1",
                },
                session: {
                    seller: userId,
                } as Partial<Express.Session>,
            },
            user: await UserModel.findById(userId),
            res: {
                clearCookie: jest.fn(),
            },
        },
    });
};
