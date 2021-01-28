import { Authorized, Field, InterfaceType, ObjectType } from "type-graphql";

@InterfaceType({
    resolveType: (value) => value.constructor.name,
})
export abstract class AbsError implements Error {
    @Field(() => String)
    message: string;

    @Field(() => String)
    name: string;

    @Field(() => [String])
    @Authorized() // Admin만 볼수있음!
    stack?: string;
}

@ObjectType({
    description: "비지니스 레벨 에러",
})
export class UserError extends AbsError {
    @Field(() => String)
    field: string;

    @Field(() => String)
    details: string;
}
