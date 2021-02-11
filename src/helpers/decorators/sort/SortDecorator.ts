import { getMetadataStorage, ReturnTypeFunc } from "../types";

export function Sort(returnTypeFunction?: ReturnTypeFunc): PropertyDecorator {
    return (prototype, field: string | symbol) => {
        const metadataStorage = getMetadataStorage();
        metadataStorage.sorting.push({
            field,
            sortOpts: ["desc", "asc"],
            target: prototype.constructor,
            getReturnType: returnTypeFunction || (() => String),
        });
    };
}
