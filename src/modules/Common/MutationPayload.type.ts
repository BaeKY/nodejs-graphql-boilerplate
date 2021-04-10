import { ValidationError } from "class-validator";
import { ClassType, Field, ObjectType } from "type-graphql";
import { UserError } from "./Error.type";

const CLASS_NAME = "MutationResponse";

@ObjectType()
export class BasicMutationResponse {
    constructor(ok?: boolean) {
        this.ok = ok === false ? false : true;
        this.errors = [];
    }
    @Field(() => Boolean)
    ok: boolean;

    @Field(() => [UserError], { nullable: true })
    errors: UserError[];

    setUserError(error: UserError, ok = false) {
        if (!(error instanceof Error)) {
            throw error;
        }
        this.errors.push(error);
        this.ok = ok;
    }

    setArgumentError(errors: ValidationError[], ok = false) {
        this.ok = ok;
        this.errors.push(
            ...errors.map((v) => UserError.fromValidationError(v))
        );
    }

    setData(..._: any) {
        // empty
    }
}

export const MutationResponse = <T>(tClass: ClassType<T>, name: string) => {
    @ObjectType(`${name || tClass.name}${CLASS_NAME}`)
    class BaseResponseClass extends BasicMutationResponse {
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

export const MutationListResponse = <T>(tClass: ClassType<T>, name: string) => {
    @ObjectType(`${name || tClass.name}${CLASS_NAME}`)
    class BaseResponseClass extends BasicMutationResponse {
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
