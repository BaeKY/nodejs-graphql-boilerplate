import { Resolver, Mutation, Ctx } from "type-graphql";
import { PlainResponse } from "../../../helpers/BaseResponse.type";
import { Context } from "../../../types/types";

@Resolver()
export class SignOutResolver {
    @Mutation(() => PlainResponse)
    async SignOut(@Ctx() context: Context): Promise<PlainResponse> {
        const response = new PlainResponse();
        response.init();
        try {
            context.req.session.seller = undefined;
            context.req.session.save((err: any) => {
                if (err) {
                    console.log(err);
                }
            });
            return response;
        } catch (error) {
            response.setError(error);
            return response;
        }
    }
}
