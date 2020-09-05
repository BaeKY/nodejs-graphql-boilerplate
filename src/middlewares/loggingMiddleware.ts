import {
    MiddlewareFn,
    ArgumentValidationError,
    ArgsDictionary,
} from "type-graphql";
import { Context } from "types";
import { GraphQLResolveInfo } from "graphql";
import { loggerCloudWatch } from "../logger";

const getIpAddress = (req: any) => {
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

const logFormat = (input: {
    context: Context;
    info: GraphQLResolveInfo;
    args: ArgsDictionary;
    dateTime: number;
    resTime: number;
    data: any;
}): {
    date: Date;
    method: string;
    ipAddress: string;
    resTime: number;
    userInfo: { name: string; email?: string; id?: any };
    args: any;
    data: any;
} => {
    const { context, info, args, dateTime, resTime, data } = input;

    const userName = context.user?.name || "anonymous";

    const formatted = {
        date: new Date(dateTime),
        method: `${info.parentType.name}.${info.fieldName}`,
        ipAddress: getIpAddress(context.req),
        resTime,
        userInfo: {
            name: userName,
            email: context.user?.email || undefined,
            id: context.user?._id,
        },
        args,
        data,
    };
    return formatted;
};

export const AccessLogging: MiddlewareFn<Context> = async (
    { context, info, args },
    next
) => {
    const start = Date.now();
    const result = await next();
    const formattedLog = logFormat({
        context,
        args,
        info,
        dateTime: start,
        resTime: Date.now() - start,
        data: result,
    });

    loggerCloudWatch.info(JSON.stringify(formattedLog));

    console.log({ ...formattedLog, data: JSON.stringify(formattedLog.data) });
    return result;
};

export const ErrorInterceptor: MiddlewareFn<any> = async (
    { context, info, args },
    next
) => {
    try {
        return await next();
    } catch (err) {
        const start = Date.now();
        const formattedLog = logFormat({
            context,
            args,
            info,
            dateTime: start,
            resTime: Date.now() - start,
            data: {
                name: err.name,
                message: err.message,
                stack: err.stack,
            },
        });
        if (!(err instanceof ArgumentValidationError)) {
            console.log({ err });
            // hide errors from db like printing sql query

            loggerCloudWatch.error(JSON.stringify(formattedLog));
            throw new Error("Unknown error occurred. Try again later!");
        }
        throw err;
    }
};
