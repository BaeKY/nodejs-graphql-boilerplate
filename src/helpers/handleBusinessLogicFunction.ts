import { ValidationError } from "class-validator";
import { ClassType, UnauthorizedError } from "type-graphql";
import { UserError } from "../modules/Common/Error.type";
import { BasicMutationResponse } from "../modules/Common/MutationPayload.type";

export const handleBusinessError = async <
    A = any,
    T extends BasicMutationResponse = BasicMutationResponse
>(
    ResCls: ClassType<T>,
    main: (response: T) => Promise<A>
): Promise<T> => {
    const response = new ResCls();
    try {
        const data = await main(response);
        response.setData(data);
    } catch (error) {
        console.info(error);
        if (error instanceof Array) {
            error.forEach((err) => {
                filterErrorForClient(err, response);
            })
        } else {
            filterErrorForClient(error, response);
        }
        response.ok = false;
    }
    return response
}

const filterErrorForClient = (error: any, response: any): void => {
    if (error instanceof ValidationError) {
        response.addError(UserError.fromValidationError(error))
    } else if (error instanceof UserError) {
        // 개발자가 직접 출력한 에러
        response.addError(error)
    } else if (error instanceof UnauthorizedError) {
        // FIXME: 아마도 권한 에러가 들어가야 할것 같은데... 에러타입이 잘못되어있네 - 20210315
        // Permission 에러도 사실은 UserError로 나올것 같긴 하다. 고민좀 해보자
        response.authError()
    } else {
        throw error;
    }
}
