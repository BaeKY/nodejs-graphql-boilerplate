import { Resolver, Mutation, Args, ArgsType, Field, Ctx } from "type-graphql";
import { GenerateResponse } from "../../helpers/BaseResponse.type";
import { User, UserModel } from "../../models/User/User.type";
import { UserError } from "../Error/shared/Error.type";
import { Context } from "../../types/types";

const SignInResponse = GenerateResponse(User, "SignIn");
type SignInResponse = InstanceType<typeof SignInResponse>;

@ArgsType()
export class SignInArgs {
    @Field(() => String)
    email: string;

    @Field(() => String)
    password: string;
}

@Resolver()
export class SignInResolver {
    @Mutation(() => SignInResponse)
    async SignIn(
        @Args(() => SignInArgs) input: SignInArgs,
        @Ctx() context: Context
    ): Promise<SignInResponse> {
        const response = new SignInResponse();
        response.init();
        try {
            const { email, password } = input;
            const user = await UserModel.findOne({
                email,
            });
            if (!user || !user.comparePassword(password)) {
                throw new UserError(
                    "Email 또는 Password를 확인해주세요",
                    "INVALID_EMAIL_OR_PASSWORD"
                );
            }
            context.req.session["seller"] = user._id.toHexString();
            context.req.session.save((err) => {
                if (err) {
                    console.log(err);
                }
            });
            response.setData(user);
        } catch (error) {
            response.setError(error);
        }
        return response;
    }
}
