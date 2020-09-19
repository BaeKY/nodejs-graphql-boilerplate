import { ArgsType, Field, Mutation, Args, Resolver } from "type-graphql";
import { ObjectId } from "mongodb";
import { VerificationTarget } from "../../models/Verification/Verification.type";
import { mongoose } from "@typegoose/typegoose";
import { verificationFind } from "../../models/Verification/Verification.function";
import {
    VerificationProcessResponse,
    VerificationStartResponse,
} from "./VerificationStart.resolver";

@ArgsType()
export class VerificationCompleteArgs {
    @Field(() => ObjectId)
    verificationId: ObjectId;

    @Field(() => VerificationTarget)
    target: VerificationTarget;

    @Field(() => String)
    code: string;

    @Field(() => String)
    payload: string;
}

@Resolver()
export class VerificationComplete {
    @Mutation(() => VerificationProcessResponse)
    async VerificationComplete(
        @Args(() => VerificationCompleteArgs) input: VerificationCompleteArgs
    ): Promise<VerificationStartResponse> {
        const response = new VerificationProcessResponse();

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const verification = await verificationFind(input.verificationId);
            verification.codeConfirm(input.code);
            await verification.save({ session });
            // TODO: Event 기반으로 인증 후 여러가지 액션이 나올 수 있음...
            // => ex) event:UserVerifyPhone 인 경우
            //        - 현재 로그인 되어있는 User를 Context에서 찾아서 verifiedPhone=true로 변경
            response.setData(verification);
            await session.commitTransaction();
        } catch (error) {
            response.setError(error);
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
        return response;
    }
}
