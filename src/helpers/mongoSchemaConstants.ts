import { mongoose } from "@typegoose/typegoose";

export const PROP_OPT_FOR_MAP = {
    type: mongoose.SchemaTypes.Mixed,
    default: new Map<string, any>(),
};
