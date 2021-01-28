import { AuthChecker } from "type-graphql";
import { UserType } from "../modules/User/User.interface";
import { IContext } from "../types/types";

// create auth checker function
export const authChecker: AuthChecker<IContext, UserType> = (
    { context },
    roles
): boolean => {
    const user = context.user;
    if (!user) {
        return false;
    }

    if (!roles.includes(user.type)) {
        return false;
    }
    return !!user;
};
