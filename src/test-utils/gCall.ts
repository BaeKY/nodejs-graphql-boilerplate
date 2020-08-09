import { graphql, GraphQLSchema } from "graphql";

import { createSchema } from "../utils/createSchema";
import { Maybe } from "type-graphql";

interface Options {
    source: string;
    variableValues?: Maybe<{
        [key: string]: any;
    }>;
    smsKey?: string;
}

let schema: GraphQLSchema;

export const gCall = async ({ source, variableValues, smsKey }: Options) => {
    if (!schema) {
        schema = await createSchema();
    }
    return graphql({
        schema,
        source,
        variableValues,
        contextValue: {
            req: {
                smsKey,
            },
            // manager:
            //     smsKey &&
            //     (await ManagerModel.findOne({
            //         key: smsKey
            //     })),
            res: {},
        },
    });
};
