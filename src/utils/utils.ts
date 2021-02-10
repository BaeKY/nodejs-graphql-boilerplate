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
