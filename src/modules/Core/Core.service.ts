import { DocumentType, ReturnModelType } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { ClassType } from "type-graphql";

export const BasicService = <T, CI_T, UI_T>(
    cls: ClassType<T>,
    model: ReturnModelType<typeof cls>,
    inputTypes: {
        createInput: ClassType<CI_T>;
        updateInput?: ClassType<UI_T>;
    }
) => {
    abstract class AbsService {
        protected readonly model: ReturnModelType<typeof cls>;

        constructor() {
            this.model = model;
        }

        async findById(id: ObjectId): Promise<T | null> {
            return this.model.findById(id);
        }

        async create(
            createInput: InstanceType<typeof inputTypes.createInput>,
            session?: ClientSession,
            beforeSave?: (instance: DocumentType<T>) => Promise<void>
        ): Promise<DocumentType<T>> {
            const instance = new this.model(createInput);
            if (beforeSave) {
                await beforeSave(instance);
            }
            await instance.save({ session });
            return instance;
        }

        async updateById(
            _id: ObjectId,
            updateInput: UI_T,
            session?: ClientSession
        ) {
            const t = this.model.findByIdAndUpdate(
                _id,
                {
                    $set: updateInput,
                } as any,
                { session }
            );
            return t;
        }

        async delete(id: ObjectId, session?: ClientSession) {
            return this.model.findByIdAndDelete(id, { session });
        }
    }
    return AbsService;
};
