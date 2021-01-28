import { mongoose } from "@typegoose/typegoose";
import { MiddlewareFn } from "type-graphql";
import { IContext } from "../types/types";

export const MongoSessionMiddleware: MiddlewareFn<IContext> = async (
    { context },
    next
) => {
    context.session = await mongoose.startSession();
    console.log("Mongo session start!");
    try {
        await next();
    } finally {
        context.session.endSession();
        console.log("Mongo session released!");
    }
};
