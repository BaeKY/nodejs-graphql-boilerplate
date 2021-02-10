import { Service } from "typedi";
import {
    MiddlewareInterface,
    NextFn,
    ResolverData,
    ArgumentValidationError,
    UnauthorizedError,
} from "type-graphql";

import { IContext } from "../types/context";
import { Logger } from "../logger";
import { GraphQLResolveInfo } from "graphql";

@Service()
export class ErrorLoggingMiddleware implements MiddlewareInterface<IContext> {
    constructor(private readonly logger: Logger) {}

    async use({ context, info }: ResolverData<IContext>, next: NextFn) {
        try {
            return await next();
        } catch (err) {
            const payload = toErrorLogObject(context, info, err);
            this.logger.error(payload);
            if (!isAllowedErrorForClient(err)) {
                // TODO: Slask Notification ㄱㄱ
                throw new Error(
                    "Sorry... Unknown error occurred. Try again later!"
                );
            }
            throw err;
        }
    }
}

interface LogObject {
    profile?: {
        userName: string;
        userAgent: string;
        ip: string;
        operation: string;
    };
    error?: any;
}

export const toErrorLogObject = (
    context: IContext,
    info: GraphQLResolveInfo,
    error?: Error
): LogObject => ({
    profile: {
        operation: `${info.operation.operation}.${info.fieldName}`,
        // username 대신에 userId를 넣는게 좋을듯?
        userName: context.user?.name || "Anonymous",
        userAgent: context.req.get("user-agent") || "",
        ip: context.req.ip,
    },
    error: error && {
        name: error.name,
        message: error.message,
        stack: error.stack,
    },
});

const ACCEPT_ERROR_LIST = [UnauthorizedError, ArgumentValidationError];

const isAllowedErrorForClient = (err: any) =>
    ACCEPT_ERROR_LIST.some((errType) => err instanceof errType);
