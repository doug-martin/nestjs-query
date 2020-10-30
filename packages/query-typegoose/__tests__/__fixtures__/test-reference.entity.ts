import { modelOptions, prop, Ref } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { TestEntity } from './test.entity';

@modelOptions({
  schemaOptions: {
    toObject: { virtuals: true },
  },
})
export class TestReference extends Base {
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

  public get id(): string {
    // eslint-disable-next-line no-underscore-dangle
    return this._id.toHexString();
  }
}
