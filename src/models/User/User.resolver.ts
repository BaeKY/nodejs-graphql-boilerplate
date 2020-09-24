import { Resolver, Mutation, FieldResolver, Root, Arg } from "type-graphql";
import { User, UserModel } from "./User.type";
import { generateFilterType } from "../../helpers/decorators/filter/generateFilterType";
import { DocumentType } from "@typegoose/typegoose";
import { toMongoQuery } from "../../helpers/decorators/filter/FilterDecoratorFunction";
import { generateSortType } from "../../helpers/decorators/sort/generateSortType";

export const UserFilterType = generateFilterType(User);

export const UserSortOperator = generateSortType(User);

@Resolver(() => User)
export class UserResolver {
    @Mutation(() => String, { name: "UserCreate" })
    async create(): Promise<string> {
        return "HI!";
    }

    @FieldResolver(() => [User])
    async students(
        @Root() user: User,
        @Arg("filter", UserFilterType)
        filter: any
    ): Promise<DocumentType<User>[]> {
        return UserModel.find({ ...toMongoQuery(filter) });
    }
}
