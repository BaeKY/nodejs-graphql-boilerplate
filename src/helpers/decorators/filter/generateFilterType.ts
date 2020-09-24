/* eslint-disable @typescript-eslint/ban-types */
import { Field, InputType, ClassType } from "type-graphql";
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
export const generateFilterType = <T>(type: ClassType<T>) => {
    const filtersData = getFiltersData(type);
    const typeGraphQLMetadata = getTypeGraphQLMetadataStorage();
    const graphQLModel = getTypeGraphqlModel(type, typeGraphQLMetadata);

    // Create a new empty class with the "<graphQLModel.name>Condition" name
    const filterName = `_${graphQLModel.name}Filter`;

    const filterContainer = {
        [filterName]: class {},
    };

    // Call the @InputType decorator on that class
    InputType()(filterContainer[filterName]);

    Field(() => [filterContainer[filterName]], {
        nullable: true,
    })(filterContainer[filterName].prototype, "AND");

    Field(() => [filterContainer[filterName]], {
        nullable: true,
    })(filterContainer[filterName].prototype, "OR");

    // Simulate creation of fields for this class/InputType by calling @Field()
    for (const { field, operators, getReturnType } of filtersData) {
        // When dealing with methods decorated with @Field, we need to lookup the GraphQL
        // name and use that for our filter name instead of the plain method name
        const graphQLField = typeGraphQLMetadata.fieldResolvers.find(
            (fr) => fr.target === type && fr.methodName === field
        );

        const fieldName = graphQLField ? graphQLField.schemaName : field;

        const baseReturnType =
            typeof getReturnType === "function" ? getReturnType() : String;
        Field(() => baseReturnType, { nullable: true })(
            filterContainer[filterName].prototype,
            `${String(fieldName)}_eq`
        );
        Field(() => baseReturnType, { nullable: true })(
            filterContainer[filterName].prototype,
            `${String(fieldName)}_not_eq`
        );
        for (const operator of operators) {
            // @Field에 들어가는 리턴타입임.
            const returnTypeFunction =
                ["in", "not_in"].includes(operator as any) &&
                !(baseReturnType instanceof Array)
                    ? () => [baseReturnType]
                    : () => baseReturnType;

            Field(returnTypeFunction, { nullable: true })(
                filterContainer[filterName].prototype,
                `${String(fieldName)}_${operator}`
            );
        }
    }

    const result = () => filterContainer[filterName];
    return result;
};

const getFiltersData = (type: Function) => {
    const metadataStorage = getMetadataStorage();
    const filtersData = metadataStorage.filters.filter(
        (f) => f.target === type
    );
    return filtersData;
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
