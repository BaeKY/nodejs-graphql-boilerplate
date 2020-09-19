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
