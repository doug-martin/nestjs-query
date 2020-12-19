import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { Prop, modelOptions, Ref } from '@typegoose/typegoose';
import { SubTaskEntity } from '../sub-task/sub-task.entity';
import { TagEntity } from '../tag/tag.entity';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'todo-items',
    toObject: { virtuals: true },
  },
})
export class TodoItemEntity extends Base {
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

  public get id(): string {
    // eslint-disable-next-line no-underscore-dangle
    return this._id.toHexString();
  }
}
