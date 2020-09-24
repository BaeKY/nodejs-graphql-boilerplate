import { getMetadataStorage } from "../types";

export function ValueSorting(): PropertyDecorator {
    return (prototype, field: string | symbol) => {
        const metadataStorage = getMetadataStorage();
        metadataStorage.sorts.push({
            field,
            sortOpts: ["desc", "asc"],
            target: prototype.constructor,
        });
    };
}
