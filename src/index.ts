import { mongoose } from "@typegoose/typegoose";
import dotenv from "dotenv";
dotenv.config({
    path: ".env",
});
import app from "./app";

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
