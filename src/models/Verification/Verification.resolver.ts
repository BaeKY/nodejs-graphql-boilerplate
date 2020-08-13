import { Resolver, FieldResolver, Root } from "type-graphql";
import { Verification } from "./Verification.type";

@Resolver(() => Verification)
export class VerificationResolver {
    @FieldResolver(() => Boolean)
    isExpire(@Root() root: Verification): boolean {
        return root.isExpire();
    }
}
