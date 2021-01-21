import { ClassType, ObjectType, Field } from "type-graphql";

@ObjectType("Response")
export class PlainResponse {
    constructor(ok?: boolean) {
        this.ok = ok === false ? false : true;
        this.errors = [];
    }
    @Field(() => Boolean)
    ok: boolean;

    @Field(() => [Error], { nullable: true })
    errors: Error[];

    setError(error: Error, ok = false) {
        if (!(error instanceof Error)) {
            throw error;
        }
        this.errors.push(error);
        this.ok = ok;
    }
}

export const BaseMutationResponse = <T>(tClass: ClassType<T>, name: string) => {
    @ObjectType(`${name || tClass.name}Response`)
    class BaseResponseClass extends PlainResponse {
        constructor(ok?: boolean) {
            super(ok);
        }

        @Field(() => tClass, { nullable: true })
        data?: T;

        setData(data: T) {
            this.data = data;
        }
    }
    return BaseResponseClass;
};

export const BaseMutationListResponse = <T>(
    tClass: ClassType<T>,
    name: string
) => {
    @ObjectType(`${name || tClass.name}Response`)
    class BaseResponseClass extends PlainResponse {
        constructor(ok?: boolean) {
            super(ok);
        }

        @Field(() => [tClass])
        data?: T[];

        setData(data: T[]) {
            this.data = data;
        }
    }
    return BaseResponseClass;
};
