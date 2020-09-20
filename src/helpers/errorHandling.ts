import { ApolloError } from "apollo-server-express";
import { validate } from "class-validator";

export const validateClass = async (itemClass: any) => {
    const validationErrors = await validate(itemClass);
    if (validationErrors.length !== 0) {
        throw validationErrors;
    }
};

export const ERROR_USER_ID_UNDEFINED = new ApolloError(
    "UserId is undefined.. please check it out",
    "USERID_UNDEFINED"
);
