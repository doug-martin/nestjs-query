import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ObjectId } from '@ptc-org/nestjs-query-graphql'
import mongoose, { Document } from 'mongoose'

@Schema({ timestamps: true })
export class TagEntity extends Document {
  @ObjectId()
  _id: mongoose.Types.ObjectId

  @Prop({ required: true })
  name!: string

  @Prop()
  createdAt!: Date

  @Prop()
  updatedAt!: Date

  @Prop()
  createdBy?: string

  @Prop()
  updatedBy?: string
}

export const TagEntitySchema = SchemaFactory.createForClass(TagEntity)
TagEntitySchema.virtual('todoItems', {
  ref: 'TodoItemEntity',
  localField: '_id',
  foreignField: 'tags'
})
