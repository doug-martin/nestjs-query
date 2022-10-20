import { ObjectId } from '@ptc-org/nestjs-query-graphql'
import { mongoose, prop, Ref } from '@typegoose/typegoose'

import { TestReference } from './test-reference.entity'

export class TestEntity {
  @ObjectId()
  _id!: mongoose.Types.ObjectId

  id!: string

  @prop({ required: true })
  stringType!: string

  @prop({ required: true })
  boolType!: boolean

  @prop({ required: true })
  numberType!: number

  @prop({ required: true })
  dateType!: Date

  @ObjectId()
  @prop({ ref: TestReference, required: false })
  testReference?: Ref<TestReference> | string

  @ObjectId()
  @prop({ ref: TestReference, required: false })
  testReferences?: Ref<TestReference>[]

  @ObjectId()
  @prop({
    ref: 'TestReference',
    localField: '_id',
    foreignField: 'testEntity'
  })
  virtualTestReferences?: Ref<TestReference>[]
}
