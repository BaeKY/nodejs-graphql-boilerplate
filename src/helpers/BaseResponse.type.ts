import { ClassType, ObjectType, Field } from "type-graphql";
import { UserError } from "../api/Error/shared/Error.type";

export const GenerateResponse = <T>(tClass: ClassType<T>, name: string) => {
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

export const GenerateArrayReturnResponse = <T>(
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

@ObjectType("Response")
export class PlainResponse {
    constructor(ok?: boolean) {
        this.ok = ok === false ? false : true;
        this.errors = [];
    }
    @Field(() => Boolean)
    ok: boolean;

    @Field(() => [UserError], { nullable: true })
    errors: UserError[];

    setError(error: UserError, ok = false) {
        if (!(error instanceof UserError)) {
            throw error;
        }
        this.errors.push(error);
        this.ok = ok;
    }
}
