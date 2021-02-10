import { ObjectId } from "mongodb";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Service } from "typedi";
import { WithMongoSession } from "../../decorators/MongoSession.decorator";
import { IContext } from "../../types/context";
import { BasicMutationResponse } from "../Common/MutationPayload.type";
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
        // 진행중인 VerificationId cookie에 저장
        context.res.cookie("verification", result._id.toHexString(), {
            httpOnly: true,
            signed: true,
        });
        response.setData(result);
        return response;
    }

    @WithMongoSession()
    @Mutation(() => BasicMutationResponse)
    async VerificationComplete(
        @Ctx() context: IContext,
        @Arg("input", () => VerificationVerifyInput)
        input: VerificationVerifyInput
    ) {
        const response = new BasicMutationResponse();
        const verificationIdFromCookie = context.req.signedCookies.verification;
        await this.verificationService.verifyOrError(
            new ObjectId(verificationIdFromCookie),
            input,
            context.session
        );
        return response;
    }
}
