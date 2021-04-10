import { assert } from 'console'
import { DIVIDER } from '../types'

/* eslint-disable */
export const divideFieldName = (
    field: string
): { operator: string, field: string } => {
    // TODO: Filter Query Generator 생성
    if (field === 'AND' || field === 'OR') {
        return {
            field,
            operator: field
        }
    }
    const splitted = field.split(DIVIDER)
    return {
        field: replaceFieldName(splitted[0]),
        operator: splitted[1]
    }
}

export const replaceFieldName = (fieldName: string): string => {
    console.log(`fieldName: ${fieldName}`)
    const result = fieldName.replace(/_/g, '.')
    if (result[0] === '.') {
        return `_${result.substr(1)}`
    }
    return result
}

export const toMongoQuery = (data: Record<string, any>): any => {
    const temp: any = {}
    for (const key in data) {
        const value = data[key]
        const { field, operator } = divideFieldName(key)
        if (field === 'AND' || field === 'OR') {
            // expr 타입으로 queryBuild하는아이 필요할듯
            temp.$expr = {
                [field === 'OR' ? '$or' : '$and']: toMongoExprQuery(value)
            }
        } else {
            temp[field] = {
                ...temp[field],
                ...genField(operator, value)
            }
        }
    }
    return temp
}

export const toMongoExprQuery = (data: Array<Record<string, any>>): any[] => {
    const query: any[] = []
    data.forEach((d) => {
        let temp: any
        for (const key in d) {
            const value = d[key]
            const { field, operator } = divideFieldName(key)
            if (field === 'AND' || field === 'OR') {
                // expr 타입으로 queryBuild하는아이 필요할듯
                temp = {
                    [field === 'OR' ? '$or' : '$and']: toMongoExprQuery(value)
                }
                // console.log({ temp });
            } else {
                temp = genExprField(field, operator, value)
            }
        }
        query.push(temp)
    })
    return query
}

export const genField = (
    gqlOperator: string,
    value: any
): Record<string, any> => {
    switch (gqlOperator) {
        case 'eq':
            return { $eq: value }
        case 'not_eq':
            return { $ne: value }
        case 'contains':
            return { $regex: new RegExp(`(${value})`, 'gi') }
        case 'not_contains':
            return { $not: new RegExp(`(${value})`, 'gi') }
        case 'in':
            return { $in: value }
        case 'not_in':
            return { $nin: value }
        case 'all':
            return { $all: value instanceof Array ? value : [value] }
        case 'not_all':
            return {
                $not: { $all: value instanceof Array ? value : [value] }
            }
        case 'gte':
        case 'lte':
        case 'lt':
        case 'gt':
            return {
                [`$${gqlOperator}`]: value
            }
        default:
            assert(gqlOperator, 'Not supported operator')
            return {}
    }
}

export const genExprField = (
    field: string,
    gqlOperator: string,
    value: any
): any => {
    const fieldReferrer = `$${field}`
    switch (gqlOperator) {
        case 'eq':
            return { $eq: [value, fieldReferrer] }
        case 'not_eq':
            return { $ne: [value, fieldReferrer] }
        case 'contains':
            return {
                $regexMatch: {
                    input: fieldReferrer,
                    regex: new RegExp(`(${value})`, 'i')
                }
            }
        case 'not_contains':
            return {
                $not: {
                    $regexMatch: {
                        input: fieldReferrer,
                        regex: new RegExp(`(${value})`, 'i')
                    }
                }
            }
        case 'in':
            return {
                $in: [fieldReferrer, value instanceof Array ? value : [value]]
            }
        case 'not_in':
            return {
                $not: {
                    $in: [fieldReferrer, value instanceof Array ? value : [value]]
                }
            }
        case 'all':
            return {
                $setIsSubset: [value instanceof Array ? value : [value], fieldReferrer]
            }
        case 'not_all':
            return {
                $not: {
                    $setIsSubset: [
                        value instanceof Array ? value : [value],
                        fieldReferrer
                    ]
                }
            }
        default:
            assert(gqlOperator, 'Not supported operator')
            return {}
    }
}

export interface FilterQuery {
    [fieldNoperator: string]: string | string[] | FilterQuery
}

export interface FilterQueryOutput {
    field: string
    operator: string
    value: string | string[] | FilterQueryOutput
}
