import { prop, Ref } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { TestEntity } from './test.entity';

export class TestReference extends Base {
  @prop({ required: true })
  referenceName!: string;

  @prop({ ref: TestReference, required: false })
  testEntity?: Ref<TestEntity>;

  public get id() {
    return this._id.toHexString();
  }

  public get virtualTestEntity() {
    return {
      ref: 'TestEntity',
      localField: 'testEntity',
      foreignField: '_id',
      justOne: true,
    };
  }
}
