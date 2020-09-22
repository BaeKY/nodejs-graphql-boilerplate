import { FiltersCollectionType } from "./types";

export type MetadataStorage = {
    filters: FiltersCollectionType[];
};

const metadataStorage = {
    filters: [],
};

export function getMetadataStorage(): MetadataStorage {
    return metadataStorage;
}
