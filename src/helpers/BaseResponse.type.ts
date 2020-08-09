import { ClassType, ObjectType, Field } from "type-graphql";
import { UserError } from "../api/Error/shared/Error.type";

export const BaseResponse = <T>(tClass: ClassType<T>, name: string) => {
    @ObjectType(`${name || tClass.name}Response`)
    class BaseResponseClass {
        @Field(() => Boolean)
        ok: boolean;

        @Field(() => [UserError])
        errors: UserError[];

        @Field(() => tClass, { nullable: true })
        data?: T;

        init() {
            this.ok = false;
            this.errors = [];
        }
    }
    return BaseResponseClass;
};
