import { getClassForDocument } from "@typegoose/typegoose";
import { Document } from "mongoose";

export const convertDocument = (doc: Document) => {
    const convertedDocument = doc.toObject();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const DocumentClass = getClassForDocument(doc)!;
    Object.setPrototypeOf(convertedDocument, DocumentClass.prototype);
    return convertedDocument;
};
