import { ClassType, ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class CursorPageInfo {
    @Field(() => Boolean)
    hasNextPage: boolean;

    @Field(() => String)
    endCursor: string;

    @Field(() => String)
    startCursor: string;
}

export const CursorEdge = <T>(itemClass: ClassType<T>) => {
    @ObjectType(`${itemClass.name}Edge`)
    abstract class EdgeClass {
        @Field(() => String)
        cursor: string;

        @Field(() => itemClass)
        node: T;
    }
    return EdgeClass;
};

export const CursorConnection = <T>(itemClass: ClassType<T>) => {
    @ObjectType(`${itemClass.name}Connection`)
    abstract class ConnectionClass {
        @Field(() => Int)
        totalCount: number;

        @Field(() => [CursorEdge(itemClass)])
        edges: T[];

        @Field(() => CursorPageInfo)
        pageInfo: CursorPageInfo;
    }
    return ConnectionClass;
};
