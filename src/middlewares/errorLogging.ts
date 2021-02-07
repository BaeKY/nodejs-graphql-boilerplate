import { Service } from "typedi";
import {
    MiddlewareInterface,
    NextFn,
    ResolverData,
    ArgumentValidationError,
} from "type-graphql";

import { IContext } from "../types/context";
import { Logger } from "../logger";

@Service()
export class ErrorLoggerMiddleware implements MiddlewareInterface<IContext> {
    constructor(private readonly logger: Logger) {}

    async use({ context, info }: ResolverData<IContext>, next: NextFn) {
        try {
            return await next();
        } catch (err) {
            console.log(err);
            this.logger.log({
                message: err.message,
                operation: info.operation.operation,
                fieldName: info.fieldName,
                userName: context.user?.name || "Anonymous",
            });
            if (!(err instanceof ArgumentValidationError)) {
                // hide errors from db like printing sql query
                throw new Error("Unknown error occurred. Try again later!");
            }
            throw err;
        }
    }
}
