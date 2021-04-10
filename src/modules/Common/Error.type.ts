import { ValidationError } from "class-validator";
import { Field, ObjectType } from "type-graphql";
import { objectToString } from "../../utils/utils";

@ObjectType({
    description: "비지니스 레벨 에러",
})
export class UserError {
    static fromValidationError(validationError: ValidationError) {
        return Object.assign(new UserError(), {
            field: validationError.property || "",
            value: validationError.value || "",
            details: objectToString(validationError.constraints),
        } as UserError);
    }

    @Field(() => String)
    field!: string;

    @Field(() => String)
    value!: string;

    @Field(() => String)
    details!: string;
}