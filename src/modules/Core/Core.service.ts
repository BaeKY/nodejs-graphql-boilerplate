import { ReturnModelType } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { OffsetPaging, PageInput } from "../Common/OffsetPaging.type";

export const BasicService = <T>(
    cls: { new (...args: any): T },
    model: ReturnModelType<typeof cls>
) => {
    const Pagination = OffsetPaging(cls);
    type Pagination = InstanceType<typeof Pagination>;

    abstract class CustomService {
        protected readonly model: ReturnModelType<typeof cls>;

        constructor() {
            this.model = model;
        }

        async create(
            createInput: Partial<T>,
            session?: ClientSession
        ): Promise<T> {
            const instance = new this.model(createInput);
            await instance.save({ session });
            return instance;
        }

        async updateById(
            _id: ObjectId,
            updateInput: Partial<T>,
            session?: ClientSession
        ) {
            return this.model.updateOne(
                { _id } as any,
                {
                    $set: updateInput,
                } as any,
                { session }
            );
        }

        async delete(id: ObjectId, session?: ClientSession) {
            return this.model.findByIdAndDelete(id, { session });
        }

        async findWithPaging(
            pageInput: PageInput,
            q: {
                filter?: any;
                sort?: string[];
                query?: any;
            } = {}
        ): Promise<Pagination> {
            const result = new Pagination();
            const { filter, query, sort } = q;
            result.setData(this.model, {
                pageNumber: pageInput.pageNumber,
                pageItemCount: pageInput.pageItemCount,
                filter,
                sort,
                query,
            });
            return result;
        }
    }
    return CustomService;
};
