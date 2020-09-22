import { assert } from "console";

export const divideFieldName = (
    field: string
): { operator: string; field: string } => {
    // TODO: Filter Query Generator 생성
    if (field === "AND" || field === "OR") {
        return {
            field,
            operator: field,
        };
    }
    const idx = field.indexOf("_");
    return { field: field.substr(0, idx), operator: field.substr(idx + 1) };
};

export const toMongoQuery = (data: Record<string, any>) => {
    const temp = {} as any;
    for (const key in data) {
        const value = data[key];
        const { field, operator } = divideFieldName(key);
        if (field === "AND" || field === "OR") {
            // expr 타입으로 queryBuild하는아이 필요할듯
            temp["$expr"] = {
                [field === "OR" ? "$or" : "$and"]: toMongoExprQuery(value),
            };
        } else {
            temp[field] = {
                ...temp[field],
                ...genField(operator, value),
            };
        }
    }
    return temp;
};

export const toMongoExprQuery = (data: Record<string, any>[]) => {
    const query: any[] = [];
    data.forEach((d) => {
        let temp: any;
        for (const key in d) {
            const value = d[key];
            const { field, operator } = divideFieldName(key);
            if (field === "AND" || field === "OR") {
                // expr 타입으로 queryBuild하는아이 필요할듯
                temp = {
                    [field === "OR" ? "$or" : "$and"]: toMongoExprQuery(value),
                };
                // console.log({ temp });
            } else {
                temp = genExprField(field, operator, value);
            }
        }
        query.push(temp);
    });
    return query;
};

export const genField = (
    gqlOperator: string,
    value: any
): Record<string, any> => {
    switch (gqlOperator) {
        case "eq":
            return { $eq: value };
        case "not_eq":
            return { $ne: value };
        case "contains":
            return { $regex: new RegExp(`(${value})`, "gi") };
        case "not_contains":
            return { $not: new RegExp(`(${value})`, "gi") };
        case "in":
            return { $in: value };
        case "not_in":
            return { $nin: value };
        case "include_all":
            return { $all: value instanceof Array ? value : [value] };
        case "not_include_all":
            return {
                $not: { $all: value instanceof Array ? value : [value] },
            };
        default:
            assert(gqlOperator, "Not supported operator");
            return {};
    }
};

export const genExprField = (
    field: string,
    gqlOperator: string,
    value: any
): any => {
    const fieldReferer = `$${field}`;
    switch (gqlOperator) {
        case "eq":
            return { $eq: [value, fieldReferer] };
        case "not_eq":
            return { $ne: [value, fieldReferer] };
        case "contains":
            return {
                $regexMatch: {
                    input: fieldReferer,
                    regex: new RegExp(`(${value})`, "i"),
                },
            };
        case "not_contains":
            return {
                $not: {
                    $regexMatch: {
                        input: fieldReferer,
                        regex: new RegExp(`(${value})`, "i"),
                    },
                },
            };
        case "in":
            return {
                $size: {
                    $setIntersection: [
                        value instanceof Array ? value : [value],
                        fieldReferer,
                    ],
                },
            };
        case "not_in":
            return {
                $not: {
                    $size: {
                        $setIntersection: [
                            value instanceof Array ? value : [value],
                            fieldReferer,
                        ],
                    },
                },
            };
        case "all":
            return {
                $setIsSubset: [
                    value instanceof Array ? value : [value],
                    fieldReferer,
                ],
            };
        case "not_all":
            return {
                $not: {
                    $setIsSubset: [
                        value instanceof Array ? value : [value],
                        fieldReferer,
                    ],
                },
            };
        default:
            assert(gqlOperator, "Not supported operator");
            return {};
    }
};

export type FilterQuery = {
    [fieldNoperator: string]: string | string[] | FilterQuery;
};

export type FilterQueryOutput = {
    field: string;
    operator: string;
    value: string | string[] | FilterQueryOutput;
};
