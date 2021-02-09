import { Service } from "typedi";
import {
    MiddlewareInterface,
    NextFn,
    ResolverData,
    ArgumentValidationError,
} from "type-graphql";

import { IContext } from "../types/context";
import { Logger } from "../logger";
import { GraphQLResolveInfo } from "graphql";

interface LogPayload {
    profile?: LogProfile;
    resTime?: number;
    error?: any;
}

interface LogProfile {
    userName: string;
    userAgent: string;
    ip: string;
    operation: string;
}

@Service()
export class ErrorLoggerMiddleware implements MiddlewareInterface<IContext> {
    constructor(private readonly logger: Logger) {}

    async use({ context, info }: ResolverData<IContext>, next: NextFn) {
        const start = Date.now();
        let payload: LogPayload = {};
        try {
            return await next();
        } catch (err) {
            payload = this.formatError(context, info, err);

            if (!(err instanceof ArgumentValidationError)) {
                // BusinessLogic 상의 에러임
                // hide errors from db like printing sql query
                throw new Error(
                    "Sorry... Unknown error occurred. Try again later!"
                );
            }
            throw err;
        } finally {
            payload.resTime = Date.now() - start;
            this.logger.error(payload);
        }
    }

    formatError(
        context: IContext,
        info: GraphQLResolveInfo,
        error: Error
    ): LogPayload {
        return {
            profile: {
                operation: `${info.operation.operation}.${info.fieldName}`,
                // username 대신에 userId를 넣는게 좋을듯?
                userName: context.user?.name || "Anonymous",
                userAgent: context.req.get("user-agent") || "",
                ip: context.req.ip,
            },
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        };
    }
}
