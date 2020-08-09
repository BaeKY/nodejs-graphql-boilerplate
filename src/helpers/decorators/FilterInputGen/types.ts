/* eslint-disable @typescript-eslint/ban-types */
import { GraphQLScalarType } from "graphql";

type OperatorIn = "in" | "not_in";
type OperatorContains = "contains" | "not_contains";
type OperatorEquality = "eq" | "not_eq";
type OperatorInequality = "lt" | "gt" | "lte" | "gte";
type OperatorStartWith = "start_with" | "not_start_with";
type OperatorEndWith = "end_with" | "not_end_with";
export type OperatorRecursiveType = "AND" | "OR";

/**
 * Compare string, enum, something else...
 */
export type OperatorTypes =
    | OperatorIn
    | OperatorContains
    | OperatorEquality
    | OperatorInequality
    | OperatorStartWith
    | OperatorEndWith;

export const ARRAY_RETURN_TYPE_OPERATORS = ["in", "not_in"];

export const RECURSIVE_RETURN_TYPE_OPERATORS = ["AND", "OR"];

export type ReturnTypeFunc = (
    type?: void
) => GraphQLScalarType | Function | object;

export type FiltersCollectionType = {
    target: Function;
    field: string | symbol;
    operators: OperatorTypes[];
    getReturnType?: ReturnTypeFunc;
};
