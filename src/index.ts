import "reflect-metadata";
import { mongoose, setGlobalOptions, Severity } from "@typegoose/typegoose";
import dotenv from "dotenv";
import path from "path";
{
    const env = process.argv.find((s) => s.includes("--env"))?.split("=")[1];
    dotenv.config({
        path: path.join(
            __dirname,
            env?.includes("prod") ? `../.env.prod` : `../.env.dev`
        ),
    });
}

// Set typegoose Global Options
setGlobalOptions({
    options: {
        allowMixed: Severity.ALLOW,
    },
    schemaOptions: {
        timestamps: true,
    },
});
import app from "./app";
import { IS_DEV_ENV } from "./constants";

const port = parseInt(process.env.PORT || "4000");

const main = async (): Promise<void> => {
    mongoose
        .connect(process.env.DB_URI || "", {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
        })
        .then(async () => {
            console.log("Database connect success!");
            const realApp = await app.init();
            realApp.listen({ port }, () => {
                if (IS_DEV_ENV) {
                    console.log("Debud Mode on!");
                }
                console.log(
                    `Server listening at: http://${process.env.SERVER_URL}:${port}${process.env.GRAPHQL_ENDPOINT}`
                );
            });
        })
        .catch((err) => {
            console.info(err);
        });
};

main();
