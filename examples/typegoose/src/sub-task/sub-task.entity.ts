import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { Prop, modelOptions, Ref } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { TodoItemEntity } from '../todo-item/todo-item.entity';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'sub-tasks',
    toObject: { virtuals: true },
  },
})
export class SubTaskEntity implements Base {
  _id!: Types.ObjectId;

  id!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  completed!: boolean;

  @Prop({ ref: () => TodoItemEntity, required: true })
  todoItem!: Ref<TodoItemEntity>;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}
