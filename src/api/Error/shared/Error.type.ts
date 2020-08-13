import { Field, ObjectType } from "type-graphql";
import { CommonErrorCodes, UserErrorCode } from "./ErrorCodes";
import { VerificationProcessErrorCodes } from "../../Verification/VerificationProcess/VerificationProcessErrorCodes";

@ObjectType({ description: "Display error to client-side." })
export class UserError {
    constructor(
        message: string,
        code?: CommonErrorCodes | VerificationProcessErrorCodes | UserErrorCode
    ) {
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
