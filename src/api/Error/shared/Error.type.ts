import { Field, ObjectType } from "type-graphql";
import { ErrorCodes } from "./ErrorCodes";

@ObjectType({ description: "Display error to client-side." })
export class UserError {
    constructor(message: string, code?: ErrorCodes) {
        this.message = message;
        if (code) {
            this.code = code;
        }
    }
    @Field(() => String)
    code: string;

    @Field(() => String)
    message: string;
}
