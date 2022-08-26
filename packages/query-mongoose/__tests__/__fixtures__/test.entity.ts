import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes, Types } from 'mongoose'

@Schema()
export class TestEntity extends Document {
  @Prop({ required: true })
  stringType!: string

  @Prop({ required: true })
  boolType!: boolean

  @Prop({ required: true })
  numberType!: number

  @Prop({ required: true })
  dateType!: Date

  @Prop({ type: SchemaTypes.ObjectId, ref: 'TestReference' })
  testReference?: Types.ObjectId | string

  @Prop([{ type: SchemaTypes.ObjectId, ref: 'TestReference' }])
  testReferences?: Types.ObjectId[]
}

export const TestEntitySchema = SchemaFactory.createForClass(TestEntity)
TestEntitySchema.virtual('virtualTestReferences', {
  ref: 'TestReference',
  localField: '_id',
  foreignField: 'testEntity'
})
