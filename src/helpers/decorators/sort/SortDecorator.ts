import { getMetadataStorage } from "../types";

export function ValueSorting(): PropertyDecorator {
    return (prototype, field: string | symbol) => {
        const metadataStorage = getMetadataStorage();
        metadataStorage.sorting.push({
            field,
            sortOpts: ["desc", "asc"],
            target: prototype.constructor,
        });
    };
}
