const _padStart = (d: string | number) => d.toString().padStart(2, "0");

export const dateToParts = (date: Date) => {
    return {
        y: date.getUTCFullYear(),
        m: date.getUTCMonth() + 1,
        d: date.getUTCDate(),
        h: date.getUTCHours(),
        i: date.getUTCMinutes(),
        s: date.getUTCSeconds(),
    };
};

export const formatDate = (date: Date, format = "%y%m%d%h%i%s") => {
    return format
        .replace(/%y/, date.getFullYear().toString())
        .replace(/%m/, _padStart(date.getUTCMonth() + 1))
        .replace(/%d/, _padStart(date.getUTCDate()))
        .replace(/%h/, _padStart(date.getUTCHours()))
        .replace(/%i/, _padStart(date.getUTCMinutes()))
        .replace(/%s/, _padStart(date.getUTCSeconds()));
};
