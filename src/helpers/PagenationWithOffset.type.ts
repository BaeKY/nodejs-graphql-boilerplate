import { ClassType, ObjectType, Field, Int, InputType } from "type-graphql";
import { ModelType } from "@typegoose/typegoose/lib/types";

@ObjectType()
export class OffsetPagingInfo {
    constructor(input: {
        totalDocumentCount: number;
        pageItemCount: number;
        page: number;
        currentItemCount: number;
    }) {
        const {
            page,
            currentItemCount,
            pageItemCount,
            totalDocumentCount,
        } = input;
        this.pageNumber = page;
        this.pageItemCount = pageItemCount;
        this.totalPageCount = Math.ceil(totalDocumentCount / pageItemCount);
        this.currentItemCount = currentItemCount;
    }

    @Field(() => Int, { description: "선택한 페이지 번호" })
    pageNumber: number;

    @Field(() => Int, { description: "페이지당 기준 데이터 수" })
    pageItemCount: number;

    @Field(() => Int, { description: "현재 페이지에서 출력한 데이터 수" })
    currentItemCount: number;

    @Field(() => Int, { description: "전체 페이지 수" })
    totalPageCount: number;
}

@InputType()
export class OffsetPagingInput {
    @Field(() => Int)
    pageNumber: number;

    @Field(() => Int)
    pageItemCount: number;
}

export const OffsetPaginatedData = <TItem>(TItemClass: ClassType<TItem>) => {
    @ObjectType(`OffsetPagenated${TItemClass.name}Data`)
    class OffsetPagenatedData {
        @Field(() => OffsetPagingInfo)
        pageInfo: OffsetPagingInfo;

        @Field(() => [TItemClass])
        items: TItem[];

        public async setData(
            model: ModelType<TItem>,
            pageInfo: {
                pageNumber: number;
                pageItemCount: number;
                filter?: any;
                sort?: any;
            }
        ): Promise<void> {
            const { filter, pageNumber, pageItemCount, sort } = pageInfo;
            const [totalDocumentCount, items] = await Promise.all([
                model.find(filter).countDocuments(),
                model
                    .find(filter)
                    .skip(pageNumber * pageItemCount)
                    .sort(sort)
                    .exec(),
            ]);
            this.items = items;
            this.pageInfo = new OffsetPagingInfo({
                page: pageNumber,
                currentItemCount: items.length,
                totalDocumentCount,
                pageItemCount: pageItemCount,
            });
        }
    }
    return OffsetPagenatedData;
};
