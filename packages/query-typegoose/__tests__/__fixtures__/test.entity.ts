import { TestReference } from './test-reference.entity';
import { prop, Ref, modelOptions } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';

@modelOptions({
  schemaOptions: {
    toObject: { virtuals: true },
  },
})
export class TestEntity extends Base {
  @prop({ required: true })
  stringType!: string;

  @prop({ required: true })
  boolType!: boolean;

  @prop({ required: true })
  numberType!: number;

  @prop({ required: true })
  dateType!: Date;

  @prop({ ref: TestReference, required: false })
  testReference?: Ref<TestReference>;

  @prop({ ref: TestReference, required: false })
  testReferences?: Ref<TestReference>[];

  public get id() {
    return this._id.toHexString();
  }

  public get virtualTestReferences() {
    return {
      ref: 'TestReference',
      localField: '_id',
      foreignField: 'testEntity',
    };
  }
}
