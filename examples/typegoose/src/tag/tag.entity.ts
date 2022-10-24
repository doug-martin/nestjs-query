import { ObjectId } from '@ptc-org/nestjs-query-graphql'
import { modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { Base } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

import { TodoItemEntity } from '../todo-item/todo-item.entity'

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'tags',
    toObject: { virtuals: true }
  }
})
export class TagEntity implements Base {
  @ObjectId()
  _id!: Types.ObjectId

  id!: string

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

  @ObjectId()
  @Prop({
    ref: 'TodoItemEntity',
    localField: '_id',
    foreignField: 'tags'
  })
  todoItems?: Ref<TodoItemEntity>[]
}
