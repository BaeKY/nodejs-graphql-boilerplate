import { mongoose, Prop } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Tag {
    @Field(() => String)
    @Prop()
    key: string;

    @Field(() => String)
    @Prop()
    value: string;
}

const tagToMap = (tags: [Tag]): Map<string, string> => {
    const map = new Map<string, string>();
    tags.forEach((t) => map.set(t.key, t.value));
    return map;
};

const mapToTag = (map: Map<string, string>): Tag[] => {
    const tags: Tag[] = [];
    for (const [key, value] of map) {
        tags.push(Object.assign(new Tag(), { key, value } as Tag));
    }
    return tags;
};

export const OptionsForPropMap = () => ({
    set: tagToMap,
    get: mapToTag,
    type: mongoose.Types.Map,
});
