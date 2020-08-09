import { mongoose } from "@typegoose/typegoose";
import { createCollections } from "../utils/createCollections";

export const getDBUri = (
    {
        cluster,
        name,
        password,
        user,
    }: {
        cluster: string;
        user: string;
        password: string;
        name: string;
    } = {
        name: process.env.DB_NAME || "",
        cluster: process.env.DB_CLUSTER || "",
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
    }
) => {
    return `mongodb+srv://${user}:${password}@${cluster}.mongodb.net/${name}?retryWrites=true&w=majority`;
};

export const testConn = async (
    dbUri: string = getDBUri(),
    runCreateCollections?: boolean,
    dropCollection?: boolean
) => {
    await mongoose
        .connect(dbUri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
        })
        .then(async () => {
            if (runCreateCollections) {
                await createCollections(dropCollection);
            }
            if (dropCollection) {
                console.log("Let's drop all collection~! (Under Development");
            }
        });
};
