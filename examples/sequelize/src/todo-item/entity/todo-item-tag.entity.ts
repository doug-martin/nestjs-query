import { Column, ForeignKey, Model, Table } from 'sequelize-typescript'

import { TagEntity } from '../../tag/tag.entity'
import { TodoItemEntity } from './todo-item.entity'

@Table({})
export class TodoItemEntityTags extends Model<TodoItemEntityTags> {
  @ForeignKey(() => TodoItemEntity)
  @Column
  todoItemId!: number

  @ForeignKey(() => TagEntity)
  @Column
  tagId!: number
}
