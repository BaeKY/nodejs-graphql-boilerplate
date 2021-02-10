import { BasicMutationResponse } from "../modules/Common/MutationPayload.type";

export const handleBusinessLogicError = async <T extends BasicMutationResponse>(
    response: T,
    main: (response: T) => Promise<any>
): Promise<T> => {
    try {
        await main(response);
    } catch (error) {
        if (error instanceof Array) {
            response.setArgumentError(error);
            return response;
        } else {
            throw error;
        }
    }
    return response;
};
