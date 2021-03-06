export const NODE_ENV = process.env.NODE_ENV || "dev";

export const IS_DEV_ENV = NODE_ENV === "dev";

export const ALLOWED_COMPLEXITY = parseInt(
    process.env.ALLOWED_COMPLEXITY || "100"
);

/**
 * 6000
 */
export const ONE_MINUTE = 1000 * 60;
/**
 * 360000
 */
export const ONE_HOUR = ONE_MINUTE * 60;
/**
 * 86400000
 */
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_YEAR = ONE_DAY * 365;

export enum TimeUnit {
    ONE_YEAR = 1000 * 60 * 60 * 24 * 365,
    ONE_DAY = 1000 * 60 * 60 * 24,
    ONE_HOUR = 1000 * 60 * 60,
    ONE_MINUTE = 1000 * 60,
}

export const SmsCollectionNamePrefix = "SMS";

export const mongoCollectionName = (collectionName: string): string =>
    collectionName;

export const PAYMENT_EXP_TIME_CARD = 20 * ONE_MINUTE;
export const PAYMENT_EXP_TIME_BANK_TRANSFER = ONE_DAY;

export const USER_COOKIE_NAME = process.env.USER_COOKIE_NAME || "";
