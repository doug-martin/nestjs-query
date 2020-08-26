import { mongoose, prop, Ref } from '@typegoose/typegoose';
import { TestReference } from './test-reference.entity';

export class TestEntity {
  get id() {
    const idKey = '_id';
    return ((this as unknown) as Record<string, mongoose.Types.ObjectId>)[idKey]?.toString();
  }

  @prop({ required: true })
  stringType!: string;

  @prop({ required: true })
  boolType!: boolean;

  @prop({ required: true })
  numberType!: number;

  @prop({ required: true })
  dateType!: Date;

  @prop({ ref: TestReference })
  testReference?: Ref<TestReference>;

  getInputData(): Partial<TestEntity> {
    return {
      stringType: this.stringType,
      boolType: this.boolType,
      numberType: this.numberType,
      dateType: this.dateType,
    };
  }

  getOutputData(): TestEntity {
    return {
      ...this,
      id: this.id,
    };
  }
}
