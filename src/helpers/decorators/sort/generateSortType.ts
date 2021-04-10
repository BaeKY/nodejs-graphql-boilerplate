/* eslint-disable @typescript-eslint/ban-types */
import { ClassType, registerEnumType } from 'type-graphql'
import { ObjectClassMetadata } from 'type-graphql/dist/metadata/definitions/object-class-metdata'
import { getMetadataStorage as getTypeGraphQLMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage'
import { MetadataStorage } from 'type-graphql/dist/metadata/metadata-storage'
import { isClass } from '../../../utils/utils'
import { DIVIDER, getMetadataStorage } from '../types'
import { SortingCollectionType } from '../types'

/**
 * Generate a type-graphql InputType from a @ObjectType decorated
 * class by calling the @InputType and @Field decorators
 *
 * This should be used to generate the type of the @Arg
 * decorator on the corresponding resolver.
 *
 * @param type
 */
export const generateSortType = <T>(
    type: ClassType<T>,
    ...types: Function[]
): () => any[] => {
    const typeGraphQLMetadata = getTypeGraphQLMetadataStorage()
    const graphQLModel = getTypeGraphqlModel(type, typeGraphQLMetadata)

    const sortContainer = {} as any
    const addField = generateAddFieldFunc(typeGraphQLMetadata, sortContainer)
    addField(type)
    types.forEach((t) => addField(t))

    registerEnumType(sortContainer, {
        name: `_${graphQLModel.name}Sort`,
        description: 'Auto generated sort type'
    })
    return () => [sortContainer]
}

const generateAddFieldFunc = (
    typeGraphQLMetadata: MetadataStorage,
    sortContainer: any
) => (t: Function, name?: string) => {
    const sortingData = getSortingsData(t)

    // Simulate creation of fields for this class/InputType by calling @Field()
    for (const { field, getReturnType } of sortingData) {
        // When dealing with methods decorated with @Field, we need to lookup the GraphQL
        // name and use that for our filter name instead of the plain method name
        const graphQLField = typeGraphQLMetadata.fieldResolvers.find(
            (fr) => fr.target === t && fr.methodName === field
        )
        const fieldName = (graphQLField != null) ? graphQLField.schemaName : field.toString()
        const baseReturnType =
            typeof getReturnType === 'function' ? getReturnType() : String

        if (isClass(baseReturnType) && name == null) {
            generateAddFieldFunc(typeGraphQLMetadata, sortContainer)(
                baseReturnType,
                String(fieldName)
            )
        } else if (
            baseReturnType instanceof Array &&
            isClass(baseReturnType[0]) &&
            name == null
        ) {
            generateAddFieldFunc(typeGraphQLMetadata, sortContainer)(
                baseReturnType[0],
                String(fieldName)
            )
        } else {
            const sortName = `${name != null ? name.concat('_') : ''}${fieldName}${DIVIDER}`

            sortContainer[sortName.concat('desc')] = sortName.concat('desc')
            sortContainer[sortName.concat('asc')] = sortName.concat('asc')
        }
    }
}

const getSortingsData = (type: Function): SortingCollectionType[] => {
    const metadataStorage = getMetadataStorage()
    const sortData = metadataStorage.sorting.filter((f) => f.target === type)
    return sortData
}

const getTypeGraphqlModel = (
    type: Function,
    typeGraphQLMetadata: MetadataStorage
): ObjectClassMetadata => {
    const objectTypesList = [
        ...typeGraphQLMetadata.objectTypes,
        ...typeGraphQLMetadata.interfaceTypes
    ]
    const graphQLModel = objectTypesList.find((ot) => ot.target === type)

    if (graphQLModel == null) {
        throw new Error(
            `Please decorate your class "${type.toString()}" with @ObjectType if you want to sorting it`
        )
    }
    return graphQLModel
}
