import passport from "passport";
import { Express } from "express";
import strategies from "./strategies";

export const usePassport = (app: Express) => {
    // app.use(passport.session());
    for (const { name, strategy } of strategies) {
        passport.use(name, strategy);
    }
    app.use(passport.initialize());
};
