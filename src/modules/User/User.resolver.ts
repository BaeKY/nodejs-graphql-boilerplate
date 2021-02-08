import { Arg, ClassType, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { IContext } from "../../types/context";
import { IUserService } from "./User.service";
import {
    BasicMutationResponse,
    MutationResponse,
} from "../Common/MutationPayload.type";
import { WithMongoSession } from "../../decorators/MongoSessionDecorator";
import { IUser, IUserCreateInput, UserSignInInput } from "./User.interface";

export const BasicUserResolver = <S extends IUserService>(
    name: string,
    cls: ClassType<IUser>,
    createInput: ClassType<IUserCreateInput>
) => {
    type clsType = InstanceType<typeof IUser>;
    type createInputType = InstanceType<typeof IUserCreateInput>;

    const mutationResponse = MutationResponse(cls, name);
    type mutationResponse = InstanceType<typeof mutationResponse>;

    @Service()
    @Resolver(() => cls, {
        isAbstract: true,
    })
    abstract class UserResolver {
        constructor(protected readonly userService: S) {}

        abstract accessTokenName: string;
        protected MutResponse = mutationResponse;

        @WithMongoSession()
        @Mutation(() => mutationResponse, {
            name: `${name}SignUp`,
        })
        async UserSignUp(
            @Ctx() context: IContext,
            @Arg("input", () => createInput)
            input: createInputType
        ): Promise<mutationResponse> {
            const result = new mutationResponse();
            const user = await this.userService.createUserOrErr(
                input,
                context.session
            );
            const token = this.tokenGenerate(context, user as any);
            this.tokenSetToCookie(context, token);
            result.setData(user);
            return result;
        }

        @Query(() => cls, {
            name: `${name}SignIn`,
        })
        async UserSignIn(
            @Ctx() context: IContext,
            @Arg("input", () => UserSignInInput) input: UserSignInInput
        ): Promise<clsType> {
            const user = await this.userService.findUserByEmailAndPasswordOrError(
                input
            );
            const token = this.userService.jwtEncode(
                user,
                context.req.get("user-agent") || ""
            );
            this.tokenSetToCookie(context, token);
            return user as any;
        }

        @Query(() => BasicMutationResponse, {
            name: `${name}SignOut`,
        })
        async SignOut(
            @Ctx() context: IContext
        ): Promise<BasicMutationResponse> {
            const result = new BasicMutationResponse();
            this.tokenClearToCookie(context);
            return result;
        }

        @Query(() => cls, { nullable: true, name: `${name}Profile` })
        async UserProfile(@Ctx() context: IContext): Promise<clsType | null> {
            return context.user || null;
        }

        protected tokenGenerate(context: IContext, user: IUser) {
            return this.userService.jwtEncode(
                user,
                context.req.get("user-agent") || ""
            );
        }

        protected tokenSetToCookie(context: IContext, token: string) {
            context.res.cookie(this.accessTokenName, token, {
                httpOnly: true,
                signed: true,
            });
        }

        protected tokenClearToCookie(context: IContext) {
            context.res.clearCookie(this.accessTokenName);
        }
    }
    return UserResolver;
};
