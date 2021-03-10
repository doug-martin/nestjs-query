import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { Prop, modelOptions, Ref } from '@typegoose/typegoose';
import { TodoItemEntity } from '../todo-item/todo-item.entity';
import { Types } from 'mongoose';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'tags',
    toObject: { virtuals: true },
  },
})
export class TagEntity implements Base {

  _id!: Types.ObjectId

  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;

  @Prop({
    ref: 'TodoItemEntity',
    localField: '_id',
    foreignField: 'tags',
  })
  todoItems?: Ref<TodoItemEntity>[];

}
