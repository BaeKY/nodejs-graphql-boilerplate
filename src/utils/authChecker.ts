import { AuthChecker } from "type-graphql";
import { UserRole } from "../models/User/User.type";
import { Context } from "../types/types";

// create auth checker function
export const authChecker: AuthChecker<Context, UserRole> = (
    { context },
    roles
): boolean => {
    const { user } = context;
    if (!user) {
        return false;
    }

    if (!roles.includes(user.role)) {
        return false;
    }

    console.log(roles);
    return !!user;
};
