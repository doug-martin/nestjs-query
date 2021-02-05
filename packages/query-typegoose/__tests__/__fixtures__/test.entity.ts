import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { prop, Ref } from '@typegoose/typegoose';
import { TestReference } from './test-reference.entity';

export class TestEntity extends Base {
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
  testReference?: Ref<TestReference>;

  @prop({ ref: TestReference, required: false })
  testReferences?: Ref<TestReference>[];

  @prop({
    ref: 'TestReference',
    localField: '_id',
    foreignField: 'testEntity',
  })
  virtualTestReferences?: Ref<TestReference>[];
}
