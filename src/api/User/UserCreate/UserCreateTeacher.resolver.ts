import {
    Resolver,
    Mutation,
    Args,
    Field,
    ArgsType,
    UseMiddleware,
} from "type-graphql";
import { User, UserModel, UserRole } from "../../../models/User/User.type";
import { BaseResponse } from "../../../helpers/BaseResponse.type";
import { AccessLogging } from "../../../middlewares/loggingMiddleware";

@ArgsType()
export class UserCreateInput implements Partial<User> {
    @Field(() => String)
    name: string;

    @Field(() => String)
    email: string;

    @Field(() => String)
    password: string;

    @Field(() => String)
    phoneNumber: string;

    @Field(() => String, { nullable: true })
    countryCode2: string;
}

const UserCreateResponse = BaseResponse(User, "UserCreateTeacher");
type UserCreateResponse = typeof UserCreateResponse;

@Resolver(() => User)
export class UserResolver {
    @UseMiddleware(AccessLogging)
    @Mutation(() => UserCreateResponse)
    async createTeacher(
        @Args(() => UserCreateInput)
        input: UserCreateInput
    ) {
        const response = new UserCreateResponse();
        response.init();
        const user = new UserModel(input);
        user.role = UserRole.TEACHER;
        await user.save();
        response.data = user;
        response.ok = true;
        return response;
    }
}
