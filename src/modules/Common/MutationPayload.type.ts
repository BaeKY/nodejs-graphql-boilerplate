import { ClassType, Field, ObjectType } from "type-graphql";
import { UserError } from "./error.interface";

const CLASS_NAME = "MutationPayload";

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
