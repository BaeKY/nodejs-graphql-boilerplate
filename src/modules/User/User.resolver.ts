import { Arg, ClassType, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { IContext } from "../../types/context";
import { UserMutationPayload } from "./User.type";
import { IUserService } from "./User.service";
import { BasicMutationPayload } from "../Common/MutationPayload.type";
import { WithMongoSession } from "../../decorators/MongoSessionDecorator";
import {
    IUser,
    IUserCreateInput,
    IUserUpdateInput,
    UserSignInInput,
} from "./User.interface";

export const BasicUserResolver = <
    S extends IUserService,
    T extends IUser,
    M,
    CI extends IUserCreateInput,
    UI extends IUserUpdateInput
>(
    name: string,
    classes: {
        base: ClassType<T>;
        mutPayload: ClassType<M>;
        createInput: ClassType<CI>;
        updateInput: ClassType<UI>;
    }
) => {
    @Service()
    @Resolver(() => classes.base, {
        isAbstract: true,
    })
    abstract class UserResolver {
        constructor(protected readonly userService: S) {}

        abstract accessTokenName: string;
        abstract SignUp(context: IContext, input: CI): Promise<M>;
        abstract Profile(context: IContext): Promise<T | null>;
        abstract ProfileUpdate(context: IContext, updateInput: UI): Promise<M>;

        @WithMongoSession()
        @Mutation(() => classes.mutPayload, {
            name: `${name}SignUp`,
        })
        async UserSignUp(
            @Ctx() context: IContext,
            @Arg("input", () => classes.createInput) input: CI
        ): Promise<M> {
            const result = new UserMutationPayload();
            const user = await this.userService.createUserOrErr(input);

            const token = this.tokenGenerate(context, user as any);
            this.tokenSetToCookie(context, token);
            result.setData(user);
            return this.SignUp(context, input);
        }

        @WithMongoSession()
        @Mutation(() => classes.mutPayload, {
            name: `${name}ProfileUpdate`,
        })
        async UserProfileUpdate(
            @Ctx() context: IContext,
            @Arg("input", () => classes.updateInput) input: UI
        ) {
            return this.ProfileUpdate(context, input);
        }

        @Query(() => classes.base, {
            name: `${name}SignIn`,
        })
        async UserSignIn(
            @Ctx() context: IContext,
            @Arg("input", () => UserSignInInput) input: UserSignInInput
        ): Promise<T> {
            const user = await this.userService.findUserByEmailAndPasswordOrError(
                input
            );
            const token = this.userService.accessTokenGenerate(
                user,
                context.req.get("user-agent") || ""
            );
            this.tokenSetToCookie(context, token);
            return user as any;
        }

        @Query(() => BasicMutationPayload, {
            name: `${name}SignOut`,
        })
        async SignOut(@Ctx() context: IContext): Promise<BasicMutationPayload> {
            const result = new BasicMutationPayload();
            this.tokenClearToCookie(context);
            return result;
        }

        @Query(() => classes.base, { nullable: true, name: `${name}Profile` })
        async UserProfile(@Ctx() context: IContext): Promise<T | null> {
            return this.Profile(context);
        }

        protected tokenGenerate(context: IContext, user: T) {
            return this.userService.accessTokenGenerate(
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
