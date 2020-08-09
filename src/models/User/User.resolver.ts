import { Resolver, Mutation, FieldResolver, Root, Arg } from "type-graphql";
import { User, UserModel } from "./User.type";
import { generateFilterType } from "../../helpers/decorators/FilterInputGen/generateFilterType";
import {
    OperatorTypes,
    OperatorRecursiveType,
} from "../../helpers/decorators/FilterInputGen/types";
import { DocumentType } from "@typegoose/typegoose";

export const UserFilterType = generateFilterType(User);

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
        filter: {
            [key in OperatorTypes | OperatorRecursiveType]: any;
        }
    ): Promise<DocumentType<User>[]> {
        console.log({ filter: filter.AND });
        return UserModel.find({ _id: { $in: user.studentIds } });
    }
}
