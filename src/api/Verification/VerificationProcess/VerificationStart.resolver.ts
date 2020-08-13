import { Resolver, Mutation, Field, ArgsType, Args } from "type-graphql";
import { ObjectId } from "mongodb";
import { GenerateResponseIncludeReturnData } from "../../../helpers/BaseResponse.type";
import {
    VerificationTarget,
    VerificationEvent,
    Verification,
} from "../../../models/Verification/Verification.type";
import { mongoose } from "@typegoose/typegoose";
import {
    verificationCreate,
    sendSmsVerificationCode,
    verificationFind,
} from "../../../models/Verification/Verification.function";

const VerificationProcessResponse = GenerateResponseIncludeReturnData(
    Verification,
    "VerificationProcess"
);
type VerificationStartResponse = InstanceType<
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
export class VerificationProcessResolver {
    @Mutation(() => VerificationProcessResponse)
    async VerificationStart(
        @Args(() => VerificationStartArgs) input: VerificationStartArgs
    ): Promise<VerificationStartResponse> {
        const response = new VerificationProcessResponse();
        response.init();
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
            await response.setDataWithCommitSession(verification, session);
            return response;
        } catch (error) {
            response.setErrorWithAbortSession(error, session);
            return response;
        }
    }

    @Mutation(() => VerificationProcessResponse)
    async VerificationComplete(
        @Args(() => VerificationCompleteArgs) input: VerificationCompleteArgs
    ): Promise<VerificationStartResponse> {
        const response = new VerificationProcessResponse();
        response.init();
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const verification = await verificationFind(input.verificationId);
            verification.codeConfirm(input.code);
            await verification.save({ session });
            // TODO: Event 기반으로 인증 후 여러가지 액션이 나올 수 있음...
            // => ex) event:UserVerifyPhone 인 경우
            //        - 현재 로그인 되어있는 User를 Context에서 찾아서 verifiedPhone=true로 변경
            await response.setDataWithCommitSession(verification, session);
            return response;
        } catch (error) {
            response.setErrorWithAbortSession(error, session);
            return response;
        }
    }
}
