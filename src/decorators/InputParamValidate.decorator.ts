import { createMethodDecorator } from "type-graphql";
import { Schema as JoiSchema } from "joi";

export function ValidateArgs(schema: JoiSchema) {
    return createMethodDecorator(async ({ args }, next) => {
        // here place your middleware code that uses custom decorator arguments

        // e.g. validation logic based on schema using joi
        try {
            await schema.validateAsync(args);
        } catch (error) {
            console.log(error);
        }
        return next();
    });
}
