import {
    Resolver,
    Query,
    Args,
    ArgsType,
    Field,
    Authorized,
} from "type-graphql";
import {
    OffsetPaginatedData,
    OffsetPagingInput,
} from "../../helpers/PaginationWithOffset.type";
import { User, UserModel, UserRole } from "../../models/User/User.type";

const UserOffsetPaginatedData = OffsetPaginatedData(User);
type UserOffsetPaginatedData = typeof UserOffsetPaginatedData;

@ArgsType()
export class UserFindInput {
    @Field(() => OffsetPagingInput)
    pageInput: OffsetPagingInput;
}

@Resolver(() => User)
export class UsersResolver {
    @Query(() => UserOffsetPaginatedData)
    @Authorized(UserRole.ADMIN)
    async users(
        @Args(() => UserFindInput)
        { pageInput: { pageItemCount, pageNumber } }: UserFindInput
    ) {
        const paginatedResult = new UserOffsetPaginatedData();
        await paginatedResult.setData(UserModel, {
            pageItemCount,
            pageNumber,
        });
        return paginatedResult;
    }
}
