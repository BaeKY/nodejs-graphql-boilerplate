import { Resolver, Ctx, Query, Authorized, UseMiddleware } from "type-graphql";
import { GenerateResponseIncludeReturnData } from "../../../helpers/BaseResponse.type";
import { User, UserRole } from "../../../models/User/User.type";
import { Context } from "../../../types/types";
import { ErrorInterceptor } from "../../../middlewares/loggingMiddleware";

const MeResponse = GenerateResponseIncludeReturnData(User, "Me");
type MeResponse = InstanceType<typeof MeResponse>;

@Resolver()
export class MeResolver {
    @Query(() => MeResponse)
    @Authorized([UserRole.TEACHER, UserRole.STUDENT])
    @UseMiddleware(ErrorInterceptor)
    async Me(@Ctx() context: Context): Promise<MeResponse> {
        const response = new MeResponse();
        response.init();
        try {
            // TODO: Something Fix...
            response.setData(context.user);
            return response;
        } catch (error) {
            response.setError(error);
            return response;
        }
    }
}
