import { ValidationError } from "class-validator";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { BasicMutationResponse } from "../Common/MutationPayload.type";

@Service()
@Resolver()
export class CoreResolver {
    @Query(() => String)
    greeting() {
        return "HelloWorld";
    }

    @Mutation(() => BasicMutationResponse)
    async errorHandlingTest(
        @Arg("input", () => String, { nullable: true }) input?: string
    ): Promise<BasicMutationResponse> {
        const response = new BasicMutationResponse();
        if (!input) {
            throw new Error("Nothing writes...");
        }
        if (input?.toLowerCase() === "error") {
            throw [new ValidationError()];
        }
        return response;
    }
}
