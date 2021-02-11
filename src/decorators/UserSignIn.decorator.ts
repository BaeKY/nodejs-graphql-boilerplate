import { createMethodDecorator, UnauthorizedError } from "type-graphql";
import { IContext } from "../types/context";
import { UserJWTPayload } from "../types/types";
import { jwtDecode } from "../utils/jwtUtils";

/**
 * Use only one decodrator for one resolver
 * This decorator throw "UnauthorizedError" when there is no sidngedcookie at cookiename variable field.
 *
 * ex)
 *  cosnt TeacherSignIn = () => SignInWith("teacher", "teacherSecret", "teacherPayload")
 *
 *  @TeacherSignIn()
 *  async TeacherProfile() { YOUR FUNCTION LOGICS }
 * @param cookieName http cookie field name
 * @param jwtSecret
 * @param field Context fieldname, storing decoded jwt value (default = "userPayload")
 */
export const SignInWith = (
    cookieName: string,
    jwtSecret: string,
    field = "userPayload"
) => {
    return createMethodDecorator<IContext>(async ({ context }, next) => {
        const accessToken = context.req.signedCookies[cookieName];
        if (accessToken) {
            context[field] = jwtDecode<UserJWTPayload>(accessToken, jwtSecret);
        } else {
            throw new UnauthorizedError();
        }
        return next();
    });
};
