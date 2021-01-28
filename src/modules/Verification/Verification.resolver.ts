import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Service } from "typedi";
import { WithMongoSession } from "../../decorators/MongoSessionDecorator";
import { IContext } from "../../types/types";
import { BasicMutationPayload } from "../Common/MutationPayload.type";
import { VerificationService } from "./Verification.service";
import {
    VerificationMutationPayload,
    Verification,
    VerificationCreateInput,
    VerificationVerifyInput,
} from "./Verification.type";

@Service()
@Resolver(() => Verification)
export class VerificationResolver {
    constructor(private readonly verificationService: VerificationService) {}

    @WithMongoSession()
    @Mutation(() => VerificationMutationPayload)
    async VerificationStart(
        @Ctx() context: IContext,
        @Arg("input", () => VerificationCreateInput)
        input: VerificationCreateInput
    ): Promise<VerificationMutationPayload> {
        const response = new VerificationMutationPayload();
        const result = await this.verificationService.create(
            input,
            context.session
        );
        response.setData(result);
        return response;
    }

    @WithMongoSession()
    @Mutation(() => BasicMutationPayload)
    async VerificationComplete(
        @Ctx() context: IContext,
        @Arg("input", () => VerificationVerifyInput)
        input: VerificationVerifyInput
    ) {
        const response = new BasicMutationPayload();
        await this.verificationService.verifyOrError(input, context.session);
        return response;
    }
}
