/* eslint-disable @typescript-eslint/ban-types */
import { Field, InputType, ClassType } from "type-graphql";
import { getMetadataStorage as getTypeGraphQLMetadataStorage } from "type-graphql/dist/metadata/getMetadataStorage";
import { DIVIDER, getMetadataStorage } from "../types";
import { MetadataStorage } from "type-graphql/dist/metadata/metadata-storage";
import { ObjectClassMetadata } from "type-graphql/dist/metadata/definitions/object-class-metdata";
import { isClass } from "../../../utils/utils";

/**
 * Generate a type-graphql InputType from a @ObjectType decorated
 * class by calling the @InputType and @Field decorators
 *
 * This should be used to generate the type of the @Arg
 * decorator on the corresponding resolver.
 *
 * @param type
 */
export const generateFilterType = <T>(
    type: ClassType<T>,
    ...types: Function[]
) => {
    const typeGraphQLMetadata = getTypeGraphQLMetadataStorage();
    const graphQLModel = getTypeGraphqlModel(type, typeGraphQLMetadata);

    // Create a new empty class with the "<graphQLModel.name>Condition" name
    const filterName = `_${graphQLModel.name}Filter`;

    const filterContainer = {
        [filterName]: class {},
    };

    const cls = filterContainer[filterName];

    // Call the @InputType decorator on that class
    InputType()(cls);

    Field(() => [cls], {
        nullable: true,
    })(cls.prototype, "AND");

    Field(() => [cls], {
        nullable: true,
    })(cls.prototype, "OR");

    const addField = generateAddFieldFunc(typeGraphQLMetadata, cls);
    addField(type);
    types.forEach((t) => addField(t));

    const result = () => cls;
    return result;
};

const generateAddFieldFunc = <T>(
    typeGraphQLMetadata: MetadataStorage,
    cls: ClassType<T>
) => (type: Function, name?: string) => {
    // Simulate creation of fields for this class/InputType by calling @Field()
    const filtersData = getFiltersData(type);
    for (const { field, operators, getReturnType } of filtersData) {
        // When dealing with methods decorated with @Field, we need to lookup the GraphQL
        // name and use that for our filter name instead of the plain method name
        const graphQLField = typeGraphQLMetadata.fieldResolvers.find(
            (fr) => fr.target === type && fr.methodName === field
        );

        const fieldName = graphQLField ? graphQLField.schemaName : field;

        const baseReturnType =
            typeof getReturnType === "function" ? getReturnType() : String;

        if (isClass(baseReturnType) && !name) {
            generateAddFieldFunc(typeGraphQLMetadata, cls)(
                baseReturnType,
                String(fieldName)
            );
        } else if (
            baseReturnType instanceof Array &&
            isClass(baseReturnType[0])
        ) {
            generateAddFieldFunc(typeGraphQLMetadata, cls)(
                baseReturnType[0],
                String(fieldName)
            );
        } else {
            Field(() => baseReturnType, { nullable: true })(
                cls.prototype,
                `${name ? name.concat("_") : ""}${String(
                    fieldName
                )}${DIVIDER}eq`
            );
            Field(() => baseReturnType, { nullable: true })(
                cls.prototype,
                `${name ? name.concat("_") : ""}${String(
                    fieldName
                )}${DIVIDER}not_eq`
            );
            for (const operator of operators) {
                // @Field에 들어가는 리턴타입임.
                const returnTypeFunction =
                    ["in", "not_in"].includes(operator as any) &&
                    !(baseReturnType instanceof Array)
                        ? () => [baseReturnType]
                        : () => baseReturnType;

                Field(returnTypeFunction, { nullable: true })(
                    cls.prototype,
                    `${name ? name.concat("_") : ""}${String(
                        fieldName
                    )}${DIVIDER}${operator}`
                );
            }
        }
    }
};

const getFiltersData = (type: Function) => {
    const metadataStorage = getMetadataStorage();
    const filtersData = metadataStorage.filters.filter(
        (f) => f.target === type
    );
    return filtersData;
};

export const getTypeGraphqlModel = (
    type: Function,
    typeGraphQLMetadata: MetadataStorage
): ObjectClassMetadata => {
    const objectTypesList = [
        ...typeGraphQLMetadata.objectTypes,
        ...typeGraphQLMetadata.interfaceTypes,
    ];
    const graphQLModel: ObjectClassMetadata | undefined = objectTypesList.find(
        (ot) => ot.target === type
    );
    if (!graphQLModel) {
        throw new Error(
            `Please decorate your class "${type}" with @ObjectType if you want to filter it`
        );
    }
    return graphQLModel;
};
