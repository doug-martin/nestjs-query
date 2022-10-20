import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ObjectId } from '@ptc-org/nestjs-query-graphql'
import mongoose, { Document, SchemaTypes, Types } from 'mongoose'

@Schema({ timestamps: true })
export class SubTaskEntity extends Document {
  @ObjectId()
  _id: mongoose.Types.ObjectId

  @Prop({ required: true })
  title!: string

  @Prop()
  description?: string

  @Prop({ required: true })
  completed!: boolean

  @Prop({ type: SchemaTypes.ObjectId, ref: 'TodoItemEntity', required: true })
  todoItem!: Types.ObjectId

  @Prop()
  createdAt!: Date

  @Prop()
  updatedAt!: Date

  @Prop()
  createdBy?: string

  @Prop()
  updatedBy?: string
}

export const SubTaskEntitySchema = SchemaFactory.createForClass(SubTaskEntity)
