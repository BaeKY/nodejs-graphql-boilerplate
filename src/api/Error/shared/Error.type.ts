import { Field, ObjectType } from "type-graphql";

@ObjectType({ description: "Display error to client-side." })
export class UserError {
    constructor(message: string) {
        this.message = message;
    }
    @Field(() => String)
    code: UserErrorCode;

    @Field(() => String)
    message: string;

    @Field(() => [String], { description: "에러 디테일들... " })
    details: string[];
}

export type UserErrorCode =
    | "UNKNOWN_ERROR"
    | "VALIDATION_ERROR"
    | "INVALID_PARAMS";
