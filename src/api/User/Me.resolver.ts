import { Resolver, Ctx, Query, Authorized } from "type-graphql";
import { UserRole, User } from "../../models/User/User.type";
import { Context } from "../../types/types";

@Resolver()
export class MeResolver {
    @Query(() => User)
    @Authorized([UserRole.TEACHER, UserRole.STUDENT])
    async Me(@Ctx() context: Context): Promise<User> {
        return context.user;
    }
}
