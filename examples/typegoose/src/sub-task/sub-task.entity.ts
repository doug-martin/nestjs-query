import { ObjectId } from '@ptc-org/nestjs-query-graphql'
import { modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { Base } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

import { TodoItemEntity } from '../todo-item/todo-item.entity'

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'sub-tasks',
    toObject: { virtuals: true }
  }
})
export class SubTaskEntity implements Base {
  @ObjectId()
  _id!: Types.ObjectId

  id!: string

  @Prop({ required: true })
  title!: string

  @Prop()
  description?: string

  @Prop({ required: true })
  completed!: boolean

  @ObjectId()
  @Prop({ ref: () => TodoItemEntity, required: true })
  todoItem!: Ref<TodoItemEntity>

  @Prop()
  createdAt!: Date

  @Prop()
  updatedAt!: Date

  @Prop()
  createdBy?: string

  @Prop()
  updatedBy?: string
}
