import { DocumentType, Prop } from "@typegoose/typegoose";
import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";
import { Node, Timestamped, TimestampedNode } from "../Core/Core.interface";
import { ObjectId } from "mongodb";
import { MutationResponse } from "../Common/MutationPayload.type";
import { ONE_HOUR, ONE_MINUTE } from "../../constants";

export enum VerificationTarget {
    Phone,
    Email,
}

registerEnumType(VerificationTarget, {
    name: "VerificationTarget",
});

@ObjectType({
    implements: [Node, Timestamped],
    description: "Email: 1시간이내, Phone: 5분 이내 인증",
})
export class Verification extends TimestampedNode {
    @Field(() => String)
    @Prop({ required: true })
    payload!: string;

    @Field(() => String)
    @Prop({ required: true })
    target!: VerificationTarget;

    @Field(() => Date, { nullable: true })
    @Prop()
    verifiedAt?: Date;

    @Prop({
        required: true,
        default(this: DocumentType<Verification>) {
            let temp: string;
            switch (this.target) {
                case VerificationTarget.Phone: {
                    temp = Math.floor(Math.random() * 1000000)
                        .toString()
                        .padStart(6, "0");
                    break;
                }
                case VerificationTarget.Email: {
                    temp = Math.random()
                        .toString(36)
                        .substr(2)
                        .slice(0, 10)
                        .toUpperCase();
                    break;
                }
                default: {
                    throw new Error("Something Wrong!");
                }
            }
            return temp;
        },
    })
    code!: string;

    @Field(() => Date)
    @Prop({
        default(this: DocumentType<Verification>) {
            const now = Date.now();
            return new Date(
                now +
                    (this.target === VerificationTarget.Email
                        ? 1 * ONE_HOUR
                        : 5 * ONE_MINUTE)
            );
        },
    })
    expiresAt!: Date;

    @Field(() => Boolean)
    isVerified() {
        return !!this.verifiedAt;
    }

    @Field(() => Boolean)
    isExpired() {
        return new Date() > this.expiresAt;
    }
}

@InputType()
export class VerificationCreateInput {
    @Field(() => String)
    payload: string;

    @Field(() => VerificationTarget)
    target: VerificationTarget;
}

@InputType()
export class VerificationVerifyInput extends VerificationCreateInput {
    @Field(() => String)
    code: string;

    @Field(() => ObjectId)
    _id!: ObjectId;
}

export const VerificationMutationPayload = MutationResponse(
    Verification,
    "Verification"
);

export type VerificationMutationPayload = InstanceType<
    typeof VerificationMutationPayload
>;
