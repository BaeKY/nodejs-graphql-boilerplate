import dotenv from "dotenv";
dotenv.config({
    path: __dirname + "/../../.env",
});
import { getDBUri, testConn } from "./testConn";

export const dbUri = getDBUri();
console.log(`setup.ts => ${dbUri}`);
testConn(dbUri).then(() => process.exit());
