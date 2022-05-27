import { prop, Ref, mongoose } from '@typegoose/typegoose';
import { TestReference } from './test-reference.entity';

export class TestEntity {
  _id!: mongoose.Types.ObjectId;

  id!: string;

  @prop({ required: true })
  stringType!: string;

  @prop({ required: true })
  boolType!: boolean;

  @prop({ required: true })
  numberType!: number;

  @prop({ required: true })
  dateType!: Date;

  @prop({ ref: TestReference, required: false })
  testReference?: Ref<TestReference> | string;

  @prop({ ref: TestReference, required: false })
  testReferences?: Ref<TestReference>[];

  @prop({
    ref: 'TestReference',
    localField: '_id',
    foreignField: 'testEntity'
  })
  virtualTestReferences?: Ref<TestReference>[];
}
