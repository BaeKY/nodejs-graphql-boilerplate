import { Resolver, Ctx, Query, Authorized } from "type-graphql";
import { ERROR_USER_ID_UNDEFINED } from "../../helpers/errorHandling";
import { UserRole, User } from "../../models/User/User.type";
import { Context } from "../../types/types";

@Resolver()
export class MeResolver {
    @Query(() => User)
    @Authorized(UserRole.TEACHER, UserRole.STUDENT)
    async Me(@Ctx() context: Context): Promise<User> {
        if (!context.user) {
            throw ERROR_USER_ID_UNDEFINED;
        }
        return context.user;
    }
}
