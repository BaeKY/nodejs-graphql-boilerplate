import { Resolver, Mutation, Field, ArgsType, Args } from "type-graphql";
import { ObjectId } from "mongodb";
import { GenerateResponse } from "../../helpers/BaseResponse.type";
import {
    VerificationTarget,
    VerificationEvent,
    Verification,
} from "../../models/Verification/Verification.type";
import { mongoose } from "@typegoose/typegoose";
import {
    verificationCreate,
    sendSmsVerificationCode,
} from "../../models/Verification/Verification.function";

export const VerificationProcessResponse = GenerateResponse(
    Verification,
    "VerificationProcess"
);
export type VerificationStartResponse = InstanceType<
    typeof VerificationProcessResponse
>;

@ArgsType()
export class VerificationStartArgs {
    @Field(() => VerificationTarget)
    target: VerificationTarget;

    @Field(() => String)
    payload: string;

    @Field(() => VerificationEvent)
    event: VerificationEvent;

    @Field(() => ObjectId, { nullable: true })
    storeGroupId?: ObjectId;
}

@Resolver()
export class VerificationProcessResolver {
    @Mutation(() => VerificationProcessResponse)
    async VerificationStart(
        @Args(() => VerificationStartArgs) input: VerificationStartArgs
    ): Promise<VerificationStartResponse> {
        const response = new VerificationProcessResponse();

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const verification = await verificationCreate(input);
            await verification.save({ session });
            if (verification.target === VerificationTarget.PHONE) {
                await sendSmsVerificationCode(verification);
            } else if (verification.target === VerificationTarget.EMAIL) {
                // TODO: Email 전송 로직 ㄱㄱ
            }
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
