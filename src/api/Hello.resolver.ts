import { Resolver, Query, Arg } from "type-graphql";

@Resolver()
export class Hello {
    @Query(() => String, { name: "Hello", description: "Hello, World~!" })
    async formats(): Promise<string> {
        return "HelloWorld~";
    }

    @Query(() => String, { name: "TestQuery", description: "Logging Test" })
    async Test(@Arg("err", () => String) param: string) {
        if (param === "err") {
            throw new Error(`${param}: Error!!`);
        }
        return param;
    }
}
