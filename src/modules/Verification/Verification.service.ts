import { getModelForClass } from "@typegoose/typegoose";
import { ClientSession } from "mongoose";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { BasicService } from "../Core/Core.service";
import {
    Verification,
    VerificationCreateInput,
    VerificationVerifyInput,
} from "./Verification.type";

export const VerificationModel = getModelForClass(Verification);

@Service()
export class VerificationService extends BasicService(
    Verification,
    VerificationModel,
    {
        createInput: VerificationCreateInput,
    }
) {
    async verifyStartOrError(
        input: VerificationCreateInput,
        session?: ClientSession
    ) {
        const verification = Object.assign(new Verification(), input);

        const result = new this.model(verification);
        await result.save({ session });
        return result;
    }

    async verifyOrError(
        verificationId: ObjectId,
        input: VerificationVerifyInput,
        session?: ClientSession
    ): Promise<void> {
        const verification = await this.model.findOne({
            _id: verificationId,
            ...input,
        });
        if (!verification) {
            throw new Error("존재하지 않는 인증정보");
        }
        if (new Date() > verification.expiresAt) {
            throw new Error("인증 시간 만료");
        }
        verification.verifiedAt = new Date();
        await verification.save({ session });
    }
}
