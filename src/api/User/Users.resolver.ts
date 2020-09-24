import {
    Resolver,
    Query,
    Args,
    ArgsType,
    Field,
    Ctx,
    Authorized,
} from "type-graphql";
import {
    OffsetPaginatedData,
    OffsetPagingInput,
} from "../../helpers/PaginationWithOffset.type";
import {
    UserFilterType,
    UserSortOperator,
} from "../../models/User/User.resolver";
import { User, UserModel, UserRole } from "../../models/User/User.type";
import { Context } from "../../types/types";

const UserOffsetPaginatedData = OffsetPaginatedData(User);
type UserOffsetPaginatedData = typeof UserOffsetPaginatedData;

@ArgsType()
export class UserFindInput {
    @Field(() => OffsetPagingInput)
    pageInput: OffsetPagingInput;

    @Field(UserFilterType, { nullable: true })
    filter: any;

    @Field(UserSortOperator, { nullable: true })
    sort: string[];
}

@Resolver(() => User)
export class UsersResolver {
    @Query(() => UserOffsetPaginatedData)
    @Authorized(UserRole.ADMIN)
    async users(
        @Args(() => UserFindInput)
        {
            pageInput: { pageItemCount, pageNumber },
            filter,
            sort,
        }: UserFindInput,
        @Ctx() context: Context
    ) {
        const user = context.user;
        console.log(user);
        const paginatedResult = new UserOffsetPaginatedData();
        await paginatedResult.setData(UserModel, {
            pageItemCount,
            pageNumber,
        });

        console.log({
            filter,
            sort,
        });
        return paginatedResult;
    }
}
