import { ModelType } from "@typegoose/typegoose/lib/types";
import { ClassType, ObjectType, Field, Int, InputType } from "type-graphql";
import { toMongoQuery } from "../../helpers/decorators/filter/filterParser";

@ObjectType()
export class PageInfo {
    setData(input: {
        totalDocumentCount: number;
        pageItemCount: number;
        page: number;
        currentItemCount: number;
    }) {
        const {
            page: pageIndex,
            currentItemCount,
            pageItemCount: pageRowCount,
            totalDocumentCount,
        } = input;
        this.pageIndex = pageIndex;
        this.pageRowCount = pageRowCount;

        // 이거 두개만 설정하면되네
        this.totalPageCount = Math.ceil(totalDocumentCount / pageRowCount);
        this.currentItemCount = currentItemCount;
    }

    @Field(() => Int, { description: "선택한 페이지 번호" })
    pageIndex: number;

    @Field(() => Int, { description: "페이지당 기준 데이터 수" })
    pageRowCount: number;

    @Field(() => Int, { description: "현재 페이지에서 출력한 데이터 수" })
    currentItemCount: number;

    @Field(() => Int, { description: "전체 페이지 수" })
    totalPageCount: number;
}

@InputType()
export class PageInput {
    @Field(() => Int)
    pageNumber: number;

    @Field(() => Int)
    pageItemCount: number;
}

export const OffsetPaging = <TItem>(TItemClass: ClassType<TItem>) => {
    @ObjectType(`${TItemClass.name}PagingOffsetData`)
    class OffsetPagenatedData {
        @Field(() => PageInfo)
        pageInfo: PageInfo;

        @Field(() => [TItemClass])
        items: TItem[];

        public setPageInfo(pageIndex: number, pageRowCount: number) {
            this.pageInfo = new PageInfo();
            this.pageInfo.pageIndex = pageIndex;
            this.pageInfo.pageRowCount = pageRowCount;
            return this;
        }

        public async setData(
            model: ModelType<TItem>,
            pageInfo: {
                pageNumber: number;
                pageItemCount: number;
                query?: any;
                filter?: any;
                sort?: string[];
            }
        ): Promise<void> {
            const { filter, pageNumber, pageItemCount, sort, query } = pageInfo;
            const filterQuery = toMongoQuery(filter);
            const [totalDocumentCount, items] = await Promise.all([
                model.find(filterQuery).find(query).countDocuments(),
                model
                    .find(filterQuery)
                    .find(query)
                    .skip(pageNumber * pageItemCount)
                    .sort(toMongoSort(sort))
                    .exec(),
            ]);
            this.items = items;
            this.pageInfo = new PageInfo();
            this.pageInfo.setData({
                page: pageNumber,
                currentItemCount: items.length,
                totalDocumentCount,
                pageItemCount,
            });
        }
    }
    return OffsetPagenatedData;
};

const toMongoSort = (rawSort?: string[]) => {
    if (!rawSort) {
        return undefined;
    }
    const temp = {} as any;
    rawSort.forEach((r) => {
        const d = r.split("_");
        temp[d[0]] = d[1] === "asc" ? 1 : -1;
    });
    return temp;
};
