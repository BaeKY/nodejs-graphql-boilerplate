import { mongoose } from "@typegoose/typegoose";
import { createMethodDecorator } from "type-graphql";
import { IContext } from "../types/context";

export function WithMongoSession() {
    return createMethodDecorator<IContext>(async ({ context }, next) => {
        context.session = await mongoose.startSession();
        console.log("Mongo session start!");
        try {
            await context.session.withTransaction(async () => {
                await next();
            });
        } finally {
            context.session.endSession();
            console.log("Mongo session released!");
        }
    });
}
