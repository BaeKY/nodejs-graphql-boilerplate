import { Query, Resolver } from "type-graphql";

@Resolver()
export class CoreResolver {
    @Query(() => String)
    greeting() {
        return "HelloWorld";
    }
}
