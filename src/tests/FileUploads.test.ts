import { gCall } from "../test-utils/gCall";
import { mongoose } from "@typegoose/typegoose";
import { testConn } from "../test-utils/testConn";
import fs from "fs";
import { resolve } from "path";
import { ObjectId } from "mongodb";
import { print } from "graphql";
import { gql } from "apollo-server-express";
import { dbUri } from "../test-utils/setup";

beforeAll(async () => {
    await testConn(dbUri, true);
});
afterAll(async () => {
    await mongoose.connection.close();
});

// 아래 URL 참조...
// https://medium.com/@semur.nabiev/unit-test-file-uploads-in-your-apollo-graphql-server-766c7d07a605
export const imgUploadTest = async (ownerId: ObjectId, inputs: any) => {
    const response = await gCall({
        source: print(gql`
            mutation uploads($files: [FileInput!]!) {
                FileUploads(files: $files) {
                    ok
                    errors {
                        code
                        message
                        details
                    }
                    data {
                        _id
                        name
                    }
                }
            }
        `),
        userId: ownerId,
        variableValues: { files: inputs },
    });
    console.log(response);
    return response;
};

it("UploadFile", async () => {
    const file1 = fs.createReadStream(
        resolve("src/tests/resources/testimg_01.jpg")
    );
    const file2 = fs.createReadStream(
        resolve("src/tests/resources/testimg_02.jpg")
    );
    const file3 = fs.createReadStream(
        resolve("src/tests/resources/testimg_03.jpg")
    );
    const file4 = fs.createReadStream(
        resolve("src/tests/resources/testimg_04.png")
    );
    const response = await imgUploadTest(
        new ObjectId("5f5201e6f192ed4fb8d00028"),
        [
            {
                upload: new Promise((resolve) =>
                    resolve({
                        createReadStream: () => file1,
                        stream: file1,
                        filename: "테스트테스트.jpg",
                        mimetype: `image/jpeg`,
                    })
                ),
                tags: [
                    {
                        key: "level",
                        value: "AL",
                    },
                    {
                        key: "examtype",
                        value: "OPIC",
                    },
                ],
            },
            {
                upload: new Promise((resolve) =>
                    resolve({
                        createReadStream: () => file2,
                        stream: file2,
                        filename: "테스트4입니다.jpg",
                        mimetype: `image/jpeg`,
                    })
                ),
                tags: [
                    {
                        key: "level",
                        value: "IM3",
                    },
                    {
                        key: "examtype",
                        value: "OPIC",
                    },
                ],
            },
            {
                upload: new Promise((resolve) =>
                    resolve({
                        createReadStream: () => file3,
                        stream: file3,
                        filename: "testing_2.jpg",
                        mimetype: `image/jpeg`,
                    })
                ),
                tags: [
                    {
                        key: "level",
                        value: "IH",
                    },
                    {
                        key: "examtype",
                        value: "OPIC",
                    },
                ],
            },
            {
                upload: new Promise((resolve) =>
                    resolve({
                        createReadStream: () => file4,
                        stream: file4,
                        filename: "testing_4444.png",
                        mimetype: `image/png`,
                    })
                ),
                tags: [
                    {
                        key: "service",
                        value: "BK_LITE",
                    },
                ],
            },
        ]
    );
    expect(response).toMatchObject({
        data: {
            FileUploads: {
                ok: true,
                errors: [],
                data: expect.any(Array),
            },
        },
    });
});
