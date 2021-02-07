import { getModelForClass } from "@typegoose/typegoose";
import { ClientSession } from "mongoose";
import { Service } from "typedi";
import { IContext } from "../../types/context";
import { BasicService } from "../Core/Core.service";
import {
    Verification,
    VerificationCreateInput,
    VerificationVerifyInput,
} from "./Verification.type";
import { ObjectId } from "mongodb";

export const VerificationModel = getModelForClass(Verification);

@Service()
export class VerificationService extends BasicService(
    Verification,
    VerificationModel,
    {
        createInput: VerificationCreateInput,
    }
) {
    async createStart(input: VerificationCreateInput, session?: ClientSession) {
        const verification = Object.assign(new Verification(), input);

        const result = new this.model(verification);
        await result.save({ session });
        return result;
    }

    async verifyOrError(
        input: VerificationVerifyInput,
        session?: ClientSession
    ): Promise<void> {
        const verification = await this.model.findOne(input);
        if (!verification) {
            throw new Error("존재하지 않는 인증정보");
        }
        if (new Date() > verification.expiresAt) {
            throw new Error("인증 시간 만료");
        }
        verification.verifiedAt = new Date();
        await verification.save({ session });
    }

    async addVerificationToSession(
        context: IContext,
        verificationId: ObjectId
    ) {
        context.req.session["verification"] = verificationId.toHexString();
        context.req.session.save((err: any) => {
            if (err) {
                console.log(err);
            }
        });
    }

    async removeVerificationToSession(context: IContext) {
        context.req.session["verification"] = undefined;
        context.req.session.save((err: any) => {
            if (err) {
                console.log(err);
            }
        });
    }
}
