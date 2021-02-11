import { ClassType } from "type-graphql";

export const objectToString = (args: any) => {
    const temp = [] as string[];
    for (const key in args) {
        if (Object.prototype.hasOwnProperty.call(args, key)) {
            const value = args[key];
            const msg = `[${key}]: ${value}`;
            temp.push(msg);
        }
    }
    return temp.join("\n");
};

export const isClass = (func: any): func is ClassType => {
    if (typeof func === "function") {
        return /^class\s/.test(Function.prototype.toString.call(func));
    }
    return false;
};
