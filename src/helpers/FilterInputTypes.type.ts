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

// export const StringFilterInput = (field: FieldTypes) => {
//     const test = Symbol();
//     @InputType(`_${field}FilterInput`, {
//         description: `${field} filter`,
//     })
//     class _StringFilterInput implements _FilterInput {
//         @Field(() => [_StringFilterInput], {
//             nullable: true,
//         })
//         AND?: _StringFilterInput[];

//         @Field(() => [_StringFilterInput], {
//             nullable: true,
//         })
//         OR?: _StringFilterInput[];

//         @Field(() => String, {
//             name: field,
//             nullable: true,
//         })
//         _eq?: string;

//         @Field(() => String, {
//             name: `${field}_not`,
//             nullable: true,
//         })
//         _not_eq?: string;

//         @Field(() => String, {
//             name: `${field}_contains`,
//             nullable: true,
//         })
//         _contains?: string;

//         @Field(() => String, {
//             name: `${field}_not_contains`,
//             nullable: true,
//         })
//         _not_contains?: string;

//         @Field(() => [String], {
//             name: `${field}_in`,
//             nullable: true,
//         })
//         _in?: string[];

//         @Field(() => String, {
//             name: `${field}_not_in`,
//             nullable: true,
//         })
//         _not_in?: string[];

//         @Field(() => String, {
//             name: `${field}_starts_with`,
//             nullable: true,
//         })
//         _starts_with?: string;

//         @Field(() => String, {
//             name: `${field}_not_starts_with`,
//             nullable: true,
//         })
//         _not_starts_with?: string;

//         @Field(() => String, {
//             name: `${field}_ends_with`,
//             nullable: true,
//         })
//         _ends_with?: string;

//         @Field(() => String, {
//             name: `${field}_not_ends_with`,
//             nullable: true,
//         })
//         _not_ends_with?: string;

//         // TODO: 쿼리... 어떻게 만들지...? ㅋㅋㅋㅋㅋㅋㅋㅋ
//         getFilterQuery<T>(model: ModelType<T>): Query<T> {
//             const test = model.where(field);

//             const query = {} as any;
//             if (this.AND) {
//                 query.$and = this.AND.map((t) => t.getFilterQuery(model));
//             }
//             if (this.OR) {
//                 query.$or = this.OR.map((t) => t.getFilterQuery(model));
//             }
//             return test;
//         }
//     }
//     return _StringFilterInput;
// };
