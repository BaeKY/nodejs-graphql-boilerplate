import { createMethodDecorator } from "type-graphql";
import { IContext } from "../types/context";

export function AccessLogging() {
    return createMethodDecorator<IContext>(async ({ context, info }, next) => {
        const username = context.user?.name || "Anonymous";
        console.log(
            `Logging access Deco: ${username} -> ${info.parentType.name}.${info.fieldName}`
        );
        return next();
    });
}
