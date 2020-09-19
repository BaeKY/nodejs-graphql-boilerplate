import { ClassType, ObjectType, Field } from "type-graphql";
import { UserError } from "../api/Error/shared/Error.type";
import { ClientSession } from "mongoose";

export const GenerateResponse = <T>(tClass: ClassType<T>, name: string) => {
    @ObjectType(`${name || tClass.name}Response`)
    class BaseResponseClass extends PlainResponse {
        constructor(ok?: boolean) {
            super(ok);
        }
        @Field(() => Boolean)
        ok: boolean;

        @Field(() => [UserError])
        errors: UserError[];

        @Field(() => tClass, { nullable: true })
        data?: T;

        init() {
            this.ok = true;
        }

        setError(error: any) {
            this.errors = error;
        }

        setData(data: T) {
            this.data = data;
        }

        async setErrorWithAbortSession(error: any, session: ClientSession) {
            this.setError(error);
            await session.abortTransaction();
            session.endSession();
        }

        async setDataWithCommitSession(data: T, session: ClientSession) {
            this.data = data;
            await session.commitTransaction();
            session.endSession();
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
        @Field(() => Boolean)
        ok: boolean;

        @Field(() => [UserError])
        errors: UserError[];

        @Field(() => [tClass])
        data?: T[];

        init() {
            this.ok = true;
            this.errors = [];
        }

        setError(error: any, ok = false) {
            this.errors.push(error);
            this.ok = ok;
        }

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

    @Field(() => [UserError])
    errors: UserError[];

    init() {
        this.ok = true;
    }

    setError(error: UserError, ok?: boolean) {
        this.errors.push(error);
        this.ok = !!ok;
    }
}
