import { Types } from 'mongoose';
import { prop, Ref } from '@typegoose/typegoose';
import { TestEntity } from './test.entity';

export class TestReference {
  _id!: Types.ObjectId;

  id!: string;

  @prop({ required: true })
  referenceName!: string;

  @prop({ ref: () => TestEntity, required: false })
  testEntity?: Ref<TestEntity>;

  @prop({
    ref: 'TestEntity',
    localField: 'testEntity',
    foreignField: '_id',
    justOne: true,
  })
  virtualTestEntity?: Ref<TestEntity>;
}
