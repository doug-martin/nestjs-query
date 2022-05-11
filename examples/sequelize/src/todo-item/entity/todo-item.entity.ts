import {
  Table,
  Column,
  HasMany,
  Model,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  BelongsToMany,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Default,
} from 'sequelize-typescript';
import { SubTaskEntity } from '../../sub-task/sub-task.entity';
import { TagEntity } from '../../tag/tag.entity';
import { TodoItemEntityTags } from './todo-item-tag.entity';

@Table({})
export class TodoItemEntity extends Model<TodoItemEntity, Partial<TodoItemEntity>> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  title!: string;

  @AllowNull
  @Column
  description?: string;

  @Column
  completed!: boolean;

  @HasMany(() => SubTaskEntity)
  subTasks!: SubTaskEntity[];

  @CreatedAt
  created!: Date;

  @UpdatedAt
  updated!: Date;

  @BelongsToMany(
    () => TagEntity,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    () => TodoItemEntityTags,
  )
  tags!: TagEntity[];

  @AllowNull
  @Default(0)
  @Column(DataType.INTEGER)
  priority!: number;
}
