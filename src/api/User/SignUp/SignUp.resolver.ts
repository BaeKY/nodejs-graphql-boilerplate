import {
    Resolver,
    Mutation,
    Field,
    ArgsType,
    Args,
    UseMiddleware,
} from "type-graphql";
import { GenerateResponseIncludeReturnData } from "../../../helpers/BaseResponse.type";
import { User, UserRole, UserModel } from "../../../models/User/User.type";
import { mongoose } from "@typegoose/typegoose";
import { ErrorInterceptor } from "../../../middlewares/loggingMiddleware";
import { validateClass } from "../../../helpers/errorHandling";
import { UserError } from "../../Error/shared/Error.type";

const SignUpResponse = GenerateResponseIncludeReturnData(User, "SignUp");
type SignUpResponse = InstanceType<typeof SignUpResponse>;

@ArgsType()
export class SignUpInput {
    @Field(() => String)
    name: string;

    @Field(() => String)
    email: string;

    @Field(() => String)
    phoneNumber: string;

    @Field(() => String)
    password: string;

    @Field(() => String, { nullable: true })
    company?: string;
}

@Resolver()
export class SignUpResolver {
    @UseMiddleware(ErrorInterceptor)
    @Mutation(() => SignUpResponse)
    async SignUp(
        @Args(() => SignUpInput) input: SignUpInput
    ): Promise<SignUpResponse> {
        const response = new SignUpResponse();
        response.init();
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = new UserModel(input);
            user.role = UserRole.TEACHER;
            // FIXME: 지금은 일단 하드하게 Asia/Seoul, GMT+9 로 맞춤
            user.setTimezone();
            user.hashPassword();
            await validateClass(user);
            const isDuplidated = await UserModel.findOne(
                {
                    email: input.email,
                    role: UserRole.TEACHER,
                },
                { _id: 1 }
            );
            if (isDuplidated) {
                throw new UserError(
                    "Already existing user infomation",
                    "ALREADY_SIGNED_UP"
                );
            }
            await user.save({ session });
            await response.setDataWithCommitSession(user, session);
            return response;
        } catch (error) {
            await response.setErrorWithAbortSession(error, session);
            return response;
        }
    }
}
