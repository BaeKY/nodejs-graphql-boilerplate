/* eslint-disable @typescript-eslint/ban-types */
import { ClassType, registerEnumType } from "type-graphql";
import { getMetadataStorage as getTypeGraphQLMetadataStorage } from "type-graphql/dist/metadata/getMetadataStorage";
import { getMetadataStorage } from "../types";
import { MetadataStorage } from "type-graphql/dist/metadata/metadata-storage";

/**
 * Generate a type-graphql InputType from a @ObjectType decorated
 * class by calling the @InputType and @Field decorators
 *
 * This should be used to generate the type of the @Arg
 * decorator on the corresponding resolver.
 *
 * @param type
 */
export const generateSortType = <T>(type: ClassType<T>) => {
    const filtersData = getSortingsData(type);
    const typeGraphQLMetadata = getTypeGraphQLMetadataStorage();
    const graphQLModel = getTypeGraphqlModel(type, typeGraphQLMetadata);

    const sortContainer = {} as any;

    // Simulate creation of fields for this class/InputType by calling @Field()
    for (const { field } of filtersData) {
        // When dealing with methods decorated with @Field, we need to lookup the GraphQL
        // name and use that for our filter name instead of the plain method name
        const graphQLField = typeGraphQLMetadata.fieldResolvers.find(
            (fr) => fr.target === type && fr.methodName === field
        );

        const fieldName = graphQLField
            ? graphQLField.schemaName
            : field.toString();
        sortContainer[`${fieldName}_desc`] = `${fieldName}_desc`;
        sortContainer[`${fieldName}_asc`] = `${fieldName}_asc`;
    }

    registerEnumType(sortContainer, {
        name: `_${graphQLModel.name}Sort`,
        description: "Auto generated sort type",
    });

    return () => [sortContainer];
};

const getSortingsData = (type: Function) => {
    const metadataStorage = getMetadataStorage();
    const sortData = metadataStorage.sorts.filter((f) => f.target === type);
    return sortData;
};

const getTypeGraphqlModel = (
    type: Function,
    typeGraphQLMetadata: MetadataStorage
) => {
    const objectTypesList = typeGraphQLMetadata.objectTypes;
    const graphQLModel = objectTypesList.find((ot) => ot.target === type);

    if (!graphQLModel) {
        throw new Error(
            `Please decorate your class "${type}" with @ObjectType if you want to filter it`
        );
    }
    return graphQLModel;
};
