import { ObjectId } from '@ptc-org/nestjs-query-graphql'
import { mongoose, prop, Ref } from '@typegoose/typegoose'

import { TestEntity } from './test.entity'

export class TestReference {
  @ObjectId()
  _id!: mongoose.Types.ObjectId

  id!: string

  @prop({ required: true })
  referenceName!: string

  @ObjectId()
  @prop({ ref: () => TestEntity, required: false })
  testEntity?: Ref<TestEntity>

  @ObjectId()
  @prop({
    ref: 'TestEntity',
    localField: 'testEntity',
    foreignField: '_id',
    justOne: true
  })
  virtualTestEntity?: Ref<TestEntity>
}
