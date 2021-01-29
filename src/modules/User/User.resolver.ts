import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { IContext } from "../../types/types";
import {
    User,
    UserCreateInput,
    UserMutationPayload,
    UserSignInInput,
} from "./User.type";
import { UserService } from "./User.service";
import { BasicMutationPayload } from "../Common/MutationPayload.type";
import { WithMongoSession } from "../../decorators/MongoSessionDecorator";
import { UserError } from "../Common/error.interface";
import { UserType } from "./User.interface";

export interface UserResolver {
    SignUp(
        context: IContext,
        input: UserCreateInput
    ): Promise<UserMutationPayload>;
    SignIn(
        context: IContext,
        input: UserSignInInput
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
        @Arg("input", () => UserCreateInput) input: UserCreateInput
    ): Promise<UserMutationPayload> {
        const result = new UserMutationPayload();
        const data = await this.userService.saveUser(context, input);
        this.userService.accessTokenPublish(context, data);
        result.setData(data);
        return result;
    }

    @WithMongoSession()
    @Mutation(() => UserMutationPayload)
    async SignIn(
        @Ctx() context: IContext,
        @Arg("input", () => UserSignInInput) input: UserSignInInput
    ): Promise<UserMutationPayload> {
        const result = new UserMutationPayload();
        console.log(input);
        // Token 확인이 아니라... 토큰을 만들어줘야지!

        const user = await this.userService.findByEmail(
            input.email,
            UserType.Normal
        );
        const passwordCompare = await this.userService.comparePassword(
            user,
            input.password
        );
        if (user && passwordCompare) {
            this.userService.accessTokenPublish(context, user);
            result.setData(user);
        } else {
            result.setUserError(
                Object.assign(new UserError(), {
                    field: "password",
                    details: "Unexist email or wrong password!",
                })
            );
        }
        return result;
    }

    @Mutation(() => BasicMutationPayload)
    async SignOut(@Ctx() context: IContext): Promise<BasicMutationPayload> {
        const result = new BasicMutationPayload();
        this.userService.removeAccessToken(context);
        return result;
    }

    @Query(() => User, { nullable: true })
    async profile(@Ctx() context: IContext): Promise<User | null> {
        return this.userService.findByEmail(
            context.userPayload?.email || "",
            UserType.Normal
        );
    }
}
