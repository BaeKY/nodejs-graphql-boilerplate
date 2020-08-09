import { AuthChecker } from "type-graphql";

// create auth checker function
export const authChecker: AuthChecker<any> = ({ context }, roles): boolean => {
    const { user } = context;

    if (!roles.includes(user.role)) {
        return false;
    }

    console.log(roles);
    return !!user;
};
