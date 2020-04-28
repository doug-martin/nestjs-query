import { Table, ForeignKey, Column, Model } from 'sequelize-typescript';
import { TodoItemEntity } from './todo-item.entity';
import { TagEntity } from '../../tag/tag.entity';

@Table({})
export class TodoItemEntityTags extends Model<TodoItemEntityTags> {
  @ForeignKey(() => TodoItemEntity)
  @Column
  todoItemId!: number;

  @ForeignKey(() => TagEntity)
  @Column
  tagId!: number;
}
