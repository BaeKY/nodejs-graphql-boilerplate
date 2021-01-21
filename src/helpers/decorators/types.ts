/* eslint-disable @typescript-eslint/ban-types */
import { GraphQLScalarType } from "graphql";

export type MetadataStorage = {
    filters: FiltersCollectionType[];
    sorting: SortingCollectionType[];
};

const metadataStorage = {
    filters: [],
    sorting: [],
};

export function getMetadataStorage(): MetadataStorage {
    return metadataStorage;
}

type OperatorIn = "in" | "not_in";
type OperatorContains = "contains" | "not_contains";
type OperatorEquality = "eq" | "not_eq";
type OperatorInequality = "lt" | "gt" | "lte" | "gte";
// type OperatorStartWith = "start_with" | "not_start_with";
// type OperatorEndWith = "end_with" | "not_end_with";
type OperatorIncludeArr = "all" | "not_all";
export type OperatorRecursiveType = "AND" | "OR";

export type MongoOperatorIn = "$in" | "$nin";

/**
 * Compare string, enum, something else...
 */
export type OperatorType =
    | OperatorIn
    | OperatorContains
    | OperatorEquality
    | OperatorInequality
    // | OperatorStartWith
    // | OperatorEndWith
    | OperatorIncludeArr;

export const ARRAY_RETURN_TYPE_OPERATORS: OperatorType[] = [
    "in",
    "not_in",
    "all",
    "not_all",
];

export const STRING_RETURN_TYPE_OPERATORS: OperatorType[] = [
    "contains",
    "not_contains",
    "in",
    "not_in",
];

export const RECURSIVE_RETURN_TYPE_OPERATORS = ["AND", "OR"];

export type ReturnTypeFunc = (
    type?: void
) => GraphQLScalarType | Function | object;

export type FiltersCollectionType = {
    target: Function;
    field: string | symbol;
    operators: OperatorType[];
    getReturnType?: ReturnTypeFunc;
};

export type SortingCollectionType = {
    target: Function;
    field: string | symbol;
    sortOpts: SortOpt[];
};

export type SortOpt = "asc" | "desc";
