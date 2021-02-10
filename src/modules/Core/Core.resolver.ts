import { ValidationError } from "class-validator";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { AccessLogging } from "../../decorators/AccessLogging.decorator";
import { handleBusinessLogicError } from "../../helpers/handleBusinessLogicFunction";
import { BasicMutationResponse } from "../Common/MutationPayload.type";
@Service()
@Resolver()
export class CoreResolver {
    @AccessLogging()
    @Query(() => String)
    greeting() {
        return "HelloWorld";
    }

    @AccessLogging()
    @Mutation(() => BasicMutationResponse, { complexity: 10 })
    async errorHandlingTest(
        @Arg("input", () => String, { nullable: true }) input?: string
    ): Promise<BasicMutationResponse> {
        return handleBusinessLogicError(
            new BasicMutationResponse(),
            async (response) => {
                if (!input) {
                    throw new Error("Nothing writes...");
                }
                if (input?.toLowerCase() === "error") {
                    const error = new ValidationError();
                    error.property = "input";
                    error.value = input;
                    error.constraints = {
                        length: `${error.property} is too long.`,
                    };

                    throw [error];
                }
            }
        );
    }
}
