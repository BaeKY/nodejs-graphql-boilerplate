import { Field, ObjectType } from "type-graphql";
import { ValidationError } from "class-validator";
import { ErrorCodes } from "./ErrorCodes";

@ObjectType({ description: "Display error to client-side." })
export class UserError {
    constructor(
        message: string,
        code?: ErrorCodes,
        validationErrors?: ValidationError[]
    ) {
        this.message = message;
        if (code) {
            this.code = code;
        }
        if (validationErrors) {
            console.log(JSON.stringify(validationErrors));
            this.details = validationErrors.flatMap((err): string[] => {
                const messages: string[] = [];
                if (err.constraints) {
                    for (const key in err.constraints) {
                        const message = err.constraints[key];
                        messages.push(
                            `[${err.target?.constructor.name}.${err.property}] ${message} (validator=${key}, input=${err.value})`
                        );
                    }
                }
                return messages;
            });
        }
    }

    @Field(() => String, { defaultValue: "UNKNOWN_ERROR" as ErrorCodes })
    code: string;

    @Field(() => String)
    message: string;

    @Field(() => [String], { description: "에러 디테일들... ", nullable: true })
    details: string[];
}
