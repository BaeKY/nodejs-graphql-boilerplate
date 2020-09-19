import { InputType, Field } from "type-graphql";

@InputType({
    isAbstract: true,
    description: "필터 인풋 타입!",
})
export abstract class _FilterInput {
    @Field(() => [_FilterInput], {
        nullable: true,
    })
    AND?: _FilterInput[];

    @Field(() => [_FilterInput], {
        nullable: true,
    })
    OR?: _FilterInput[];
}

@InputType({
    isAbstract: true,
    description: "Filter by Name",
})
export abstract class _StringTypeFilterInput extends _FilterInput {
    @Field(() => [_StringTypeFilterInput])
    AND?: _StringTypeFilterInput[];

    @Field(() => [_StringTypeFilterInput])
    OR?: _StringTypeFilterInput[];
}
