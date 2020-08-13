import { validate } from "class-validator";

export const validateClass = async (itemClass: any) => {
    const validationErrors = await validate(itemClass);
    if (validationErrors.length !== 0) {
        throw validationErrors;
    }
};
