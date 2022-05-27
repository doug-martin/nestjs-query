import {
  Table,
  Column,
  UpdatedAt,
  BelongsToMany,
  CreatedAt,
  Model,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { TodoItemEntityTags } from '../todo-item/entity/todo-item-tag.entity';
import { TodoItemEntity } from '../todo-item/entity/todo-item.entity';

@Table({})
export class TagEntity extends Model<TagEntity, Partial<TagEntity>> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  name!: string;

  @CreatedAt
  created!: Date;

  @UpdatedAt
  updated!: Date;

  @BelongsToMany(() => TodoItemEntity, () => TodoItemEntityTags)
  todoItems!: TodoItemEntity[];
}
