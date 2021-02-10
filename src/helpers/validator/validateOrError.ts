import { validate, ValidatorOptions } from "class-validator";
import { Document } from "mongoose";
import { ArgumentValidationError } from "type-graphql";
import { convertDocument } from "../../utils/convertDocumentToClass";

/**
 * class-validator를 통해 validate한 후,
 * erorr가 나오면 thorw type-graphql의 ArgumentValidationError 타입으로 throw
 * @param args
 * @param options
 */
export const validateOrError = async (
    args: any,
    options?: ValidatorOptions
) => {
    let temp = args instanceof Document ? convertDocument(args) : args;
    const errors = await validate(temp, options);
    if (errors.length) {
        throw new ArgumentValidationError(errors);
    }
};
