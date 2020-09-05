import { Resolver, Query, Arg, UseMiddleware } from "type-graphql";
import { AccessLogging } from "../middlewares/loggingMiddleware";

@Resolver()
export class Hello {
    @Query(() => String, { name: "Hello", description: "Hello, World~!" })
    async formats(): Promise<string> {
        return "HelloWorld~";
    }

    @Query(() => String, { name: "TestQuery", description: "Logging Test" })
    @UseMiddleware(AccessLogging)
    async Test(@Arg("err", () => String) param: string) {
        if (param === "err") {
            throw new Error(`${param}: Error!!`);
        }
        return param;
    }
}
