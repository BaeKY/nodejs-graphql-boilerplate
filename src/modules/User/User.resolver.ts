import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { IContext } from "../../types/types";
import {
    User,
    UserCreateInput,
    UserMutationPayload,
    UserUpdateInput,
} from "./User.type";
import { UserService } from "./User.service";
import { BasicMutationPayload } from "../Common/MutationPayload.type";
import { WithMongoSession } from "../../decorators/MongoSessionDecorator";

export interface UserResolver {
    SignUp(
        context: IContext,
        input: UserCreateInput
    ): Promise<UserMutationPayload>;
    SignIn(
        context: IContext,
        input: UserUpdateInput
    ): Promise<UserMutationPayload>;
    profile(context: IContext): Promise<User>;
    SignOut(context: IContext): Promise<BasicMutationPayload>;
}

@Service()
@Resolver(() => User)
export class UserResolver {
    constructor(private readonly userService: UserService) {}

    @WithMongoSession()
    @Mutation(() => UserMutationPayload)
    async SignUp(
        @Ctx() context: IContext,
        @Arg("signUpInput", () => UserCreateInput) input: UserCreateInput
    ): Promise<UserMutationPayload> {
        const result = new UserMutationPayload();
        const data = await this.userService.signUp(input, context.session);
        result.setData(data);
        console.log(result);
        return result;
    }

    @Mutation(() => UserMutationPayload)
    async SignIn(
        @Ctx() context: IContext,
        @Arg("input", () => UserUpdateInput) input: UserUpdateInput
    ): Promise<UserMutationPayload> {
        console.log({
            context,
            input,
        });
        throw new Error("Method is not implemented!");
    }

    @Mutation(() => BasicMutationPayload)
    async SignOut(@Ctx() context: IContext): Promise<BasicMutationPayload> {
        console.log(context);
        throw new Error("Method is not implemented!");
    }

    @Query(() => User)
    async profile(context: IContext): Promise<User> {
        console.log(context);
        throw new Error("Method is not implemented!");
    }
}
