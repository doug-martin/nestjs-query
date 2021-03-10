import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { Prop, modelOptions, Ref } from '@typegoose/typegoose';
import { SubTaskEntity } from '../sub-task/sub-task.entity';
import { TagEntity } from '../tag/tag.entity';
import { Types } from 'mongoose';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'todo-items',
    toObject: { virtuals: true },
  },
})
export class TodoItemEntity implements Base {

  _id!: Types.ObjectId

  id!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  completed!: boolean;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;

  @Prop({ ref: () => TagEntity })
  tags!: Ref<TagEntity>[];

  @Prop({ default: 0 })
  priority!: number;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;

  @Prop({
    ref: 'SubTaskEntity',
    localField: '_id',
    foreignField: 'todoItem',
  })
  subTasks?: Ref<SubTaskEntity>[];

}
