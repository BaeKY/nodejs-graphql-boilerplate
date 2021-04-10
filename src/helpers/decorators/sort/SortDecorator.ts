import { getMetadataStorage, ReturnTypeFunc } from '../types'

export function Sorting(
    returnTypeFunction?: ReturnTypeFunc
): PropertyDecorator {
    return (prototype, field: string | symbol) => {
        const metadataStorage = getMetadataStorage()
        metadataStorage.sorting.push({
            field,
            sortOpts: ['desc', 'asc'],
            target: prototype.constructor,
            getReturnType: returnTypeFunction ?? (() => String)
        })
    }
}
