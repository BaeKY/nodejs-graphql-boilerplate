import {
    Verification,
    VerificationTarget,
    VerificationModel,
    VerificationEvent,
} from "./Verification.type";
import { DocumentType } from "@typegoose/typegoose";
import { validateClass } from "../../helpers/errorHandling";
import { ONE_MINUTE } from "../../utils/variables";
import { UserError } from "../../api/Error/shared/Error.type";
import { ObjectId } from "mongodb";

export const verificationFind = async (id: ObjectId | string) => {
    const verification = await VerificationModel.findById(id);
    if (!verification) {
        throw new UserError("Unexist Verification", "NOTHING_MATCH_WITH_ID");
    }
    return verification;
};

export const verificationCreate = async (input: {
    target: VerificationTarget;
    payload: string;
    event: VerificationEvent;
    storeGroupCode?: string;
}) => {
    const verification = new VerificationModel(input);
    verification.codeGenerate();
    verification.storeGroupCode = input.storeGroupCode;
    verification.expiresAt = new Date(Date.now() + ONE_MINUTE * 5);
    await validateClass(verification);
    return verification;
};

/**
 * verification 객체를 통해 Confirmation Code 전송
 * @param verification 이미 해당 객체는 class-validator.validate 함수를 거친 것만 들어와야함.
 */
export const sendSmsVerificationCode = async (
    verification: DocumentType<Verification>
) => {
    await validateClass(verification);

    // TODO: 여기서부터 시작!! Send SMS 함수 timespace쪽에서 가져와서 사용하긔
};
