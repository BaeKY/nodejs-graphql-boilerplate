import { Service } from "typedi";
import { IS_DEV_ENV } from "./constants";
import { loggerCloudWatch } from "./logger-cloudwatch";

@Service()
export class Logger {
    log(...args: any) {
        // replace with more sophisticated solution :)
        console.log(...args);
        if (!IS_DEV_ENV) {
            if (typeof args !== "string") {
                loggerCloudWatch.info(JSON.stringify(args, null, 2));
            } else {
                loggerCloudWatch.info(args);
            }
        }
    }

    error(...args: any[]) {
        console.error(...args);
        if (!IS_DEV_ENV) {
            if (typeof args !== "string") {
                loggerCloudWatch.error(JSON.stringify(args, null, 2));
            } else {
                loggerCloudWatch.error(args);
            }
        }
    }

    warn(...args: any) {
        console.warn(...args);
        if (!IS_DEV_ENV) {
            if (typeof args !== "string") {
                loggerCloudWatch.warn(JSON.stringify(args, null, 2));
            } else {
                loggerCloudWatch.warn(args);
            }
        }
    }
}
