import { Service } from "typedi";
import {
    MiddlewareInterface,
    NextFn,
    ResolverData,
    ArgumentValidationError,
} from "type-graphql";

import { Context } from "types";
import { Logger } from "../logger";

@Service()
export class ErrorLoggerMiddleware implements MiddlewareInterface<Context> {
    constructor(private readonly logger: Logger) {}

    async use({ context, info }: ResolverData<Context>, next: NextFn) {
        try {
            return await next();
        } catch (err) {
            this.logger.log({
                message: err.message,
                operation: info.operation.operation,
                fieldName: info.fieldName,
                userName: context.user.name,
            });
            if (!(err instanceof ArgumentValidationError)) {
                // hide errors from db like printing sql query
                throw new Error("Unknown error occurred. Try again later!");
            }
            throw err;
        }
    }
}
