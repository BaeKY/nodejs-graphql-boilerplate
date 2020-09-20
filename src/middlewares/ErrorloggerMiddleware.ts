import { MiddlewareInterface, NextFn, ResolverData } from "type-graphql";
import { Context } from "types";
import { loggerCloudWatch } from "../logger";
import { Logger } from "winston";
import { Zoneinfo } from "../api/Commons/Zoneinfo/Zoneinfo.type";
import { ObjectId } from "mongodb";
import { toApolloError } from "apollo-server-express";

export const getIpAddress = (req: any) => {
    const ffHeaderValue = req.headers["x-forwarded-for"];
    if (typeof ffHeaderValue === "string") {
        return ffHeaderValue;
    }
    return (
        (ffHeaderValue && ffHeaderValue[0]) ||
        req.connection.remoteAddress ||
        ""
    );
};

type AccessLogFormat = {
    resTime: number;
    request: {
        user: {
            name: string;
            ip: string;
            _id?: string | ObjectId;
            email?: string;
            role?: any;
            zoneinfo?: Zoneinfo;
        };
        headers: any;
        body: {
            queryName: string;
            operationName: string | null;
            variables: any;
            query: string;
        };
    };
    response: {
        headers: any;
        data: any;
        errors: any;
    };
};

export class AccessLogging implements MiddlewareInterface<Context> {
    constructor(private readonly logger: Logger) {
        this.logger = loggerCloudWatch;
    }
    async use(
        { context, info, args, root }: ResolverData<Context>,
        next: NextFn
    ) {
        // 에러 로깅은 오직 Query, Mutation 실행 함수단에서만 실행한다.
        const parentTypeName = info.parentType.name;
        const beLogging =
            parentTypeName === "Query" || parentTypeName === "Mutation";
        if (!beLogging) {
            return next();
        }
        const now = Date.now();
        let isErrorBusinessLevel = false;
        let isErrorQueryLevel = false;
        let result: any;
        const queryLevelErrors: any[] = [];
        try {
            result = await next();
            if (beLogging) {
                isErrorBusinessLevel =
                    !result.ok && parentTypeName === "Mutation";
            }
        } catch (error) {
            isErrorQueryLevel = true;
            queryLevelErrors.push(error);
            throw toApolloError(error, "UNKNOWN_ERROR");
        } finally {
            const data = JSON.stringify(
                this.formatErrorLog(
                    { info, context, args, root },
                    result,
                    queryLevelErrors,
                    now
                )
            );
            if (isErrorBusinessLevel) {
                this.logger.warn(data);
            }
            if (isErrorQueryLevel) {
                this.logger.error(data);
            }
            if (!(isErrorQueryLevel || isErrorBusinessLevel)) {
                this.logger.info(data);
            }
        }
    }

    private formatErrorLog(
        { info, context }: ResolverData<Context>,
        resultData: any,
        errors: any[],
        time: number
    ): AccessLogFormat {
        const user = context.user;
        const log: AccessLogFormat = {
            resTime: Date.now() - time,
            request: {
                headers: context.req.headers,
                user: {
                    name: user?.name || "Anonymous",
                    ip: getIpAddress(context.req),
                    _id: user?._id,
                    email: user?.email,
                    role: user?.role,
                    zoneinfo: user?.zoneinfo,
                },
                body: {
                    queryName: `${info.parentType.name}.${info.fieldName}`,
                    ...context.req.body,
                },
            },
            response: {
                headers: context.res.getHeaders(),
                data: resultData,
                errors,
            },
        };
        return log;
    }
}
