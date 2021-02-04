import { prop, Ref } from '@typegoose/typegoose'
import { Base } from '@typegoose/typegoose/lib/defaultClasses'
import { TestEntity } from './test.entity'

export class TestReference extends Base {

  id!: string

  @prop({ required: true })
  referenceName!: string

  @prop({ ref: () => TestEntity, required: false })
  testEntity?: Ref<TestEntity>

  @prop({
    ref: 'TestEntity',
    localField: 'testEntity',
    foreignField: '_id',
    justOne: true,
  })
  virtualTestEntity?: Ref<TestEntity>

}
