import { ObjectType, registerEnumType, Field } from "type-graphql";
import { CollectionDataInterface } from "../../helpers/CollectionData.type";
import {
    modelOptions,
    getModelForClass,
    prop,
    index,
} from "@typegoose/typegoose";
import { UserError } from "../../api/Error/shared/Error.type";
import { IsString, Length } from "class-validator";

export enum VerificationTarget {
    PHONE,
    EMAIL,
}

export enum VerificationEvent {
    UserVerifyPhone,
    UserVerifyEmail,
    UserFindPassword,
    UserFindEmail,
    UserUpdateInfo,
}

registerEnumType(VerificationTarget, {
    name: "VerificationTarget",
    description: "인증 타겟 Enum",
});

registerEnumType(VerificationEvent, {
    name: "VerificationEvent",
    description: "인증 타겟 Enum",
});

@ObjectType({
    implements: CollectionDataInterface,
})
@index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 60 * 60 * 24,
    }
)
@modelOptions({
    schemaOptions: {
        timestamps: true,
        collection: "Verification",
    },
})
export class Verification extends CollectionDataInterface {
    @prop()
    @Field(() => String)
    @IsString()
    @Length(6, 15)
    payload: string;

    @prop()
    @Field(() => VerificationTarget)
    target: VerificationTarget;

    @prop()
    @Field(() => Boolean)
    isVerified: boolean;

    @prop()
    @Field(() => VerificationEvent, {
        description: `어떤 액션을 위해 인증을 하는 것인지 표시 
            \t - ex) UserVerifyPhone, UserVerifyEmail, UserFindPassword, UserFindEmail, UserUpdateInfo`,
    })
    @IsString()
    event: VerificationEvent;

    @prop()
    @Field(() => String)
    storeGroupCode?: string;

    @prop()
    @Field(() => Date)
    expiresAt: Date;

    @prop()
    @IsString()
    code: string;

    codeGenerate() {
        let temp: string;
        switch (this.target) {
            case VerificationTarget.PHONE: {
                // 인증문자 전송
                temp = Math.floor(Math.random() * 1000000)
                    .toString()
                    .padStart(6, "0");
                break;
            }
            case VerificationTarget.EMAIL: {
                temp = Math.random()
                    .toString(36)
                    .substr(2)
                    .slice(0, 7)
                    .toUpperCase();
                break;
            }
            default: {
                throw new UserError(
                    "VerificationTarget이 지정되지 않았습니다.",
                    "UNDEFINED_FIELD"
                );
            }
        }
        this.code = temp;
    }

    codeConfirm(code: string) {
        if (this.isExpire()) {
            throw new UserError(
                "인증 시간이 만료되었습니다.",
                "VERIFICATION_EXPIRED"
            );
        }
        this.isVerified = this.code === code;
    }

    isExpire() {
        return this.expiresAt.getTime() < Date.now();
    }

    verify(code: string): boolean {
        if (code === this.code) {
            this.isVerified = true;
        }
        return this.isVerified;
    }
}

export const VerificationModel = getModelForClass(Verification);
