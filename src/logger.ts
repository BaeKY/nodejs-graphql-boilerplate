import "reflect-metadata";
import { createLogger } from "winston";
import AWS from "aws-sdk";
import WinstonCloudWatch from "winston-cloudwatch";

export const loggerCloudWatch = createLogger({
    transports: [
        new WinstonCloudWatch({
            logGroupName: process.env.LOG_GROUP_NAME || "ETC",
            logStreamName: (): string => {
                const DateNtime = new Date().toISOString().split("T");
                return `[${process.env.LOG_STREAM_NAME || "Nothing"}] ${
                    DateNtime[0]
                } ${DateNtime[1].substr(0, 2)}h00m`;
            },
            cloudWatchLogs: new AWS.CloudWatchLogs(),
        }),
    ],
});
