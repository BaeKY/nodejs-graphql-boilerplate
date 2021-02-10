import { Model } from "mongoose";
import { MiddlewareFn } from "type-graphql";
import { convertDocument } from "../utils/convertDocumentToClass";

export const TypegooseMiddleware: MiddlewareFn = async (_, next) => {
    const result = await next();

    if (Array.isArray(result)) {
        return result.map((item) =>
            item instanceof Model ? convertDocument(item) : item
        );
    }

    if (result instanceof Model) {
        return convertDocument(result);
    }

    return result;
};
