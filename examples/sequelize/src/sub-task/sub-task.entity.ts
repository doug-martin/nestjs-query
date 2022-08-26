import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from 'sequelize-typescript'

import { TodoItemEntity } from '../todo-item/entity/todo-item.entity'

@Table({})
export class SubTaskEntity extends Model<SubTaskEntity, Partial<SubTaskEntity>> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number

  @Column
  title!: string

  @AllowNull
  @Column
  description?: string

  @Column
  completed!: boolean

  @Column
  @ForeignKey(() => TodoItemEntity)
  todoItemId!: number

  @BelongsTo(() => TodoItemEntity)
  todoItem!: TodoItemEntity

  @CreatedAt
  created!: Date

  @UpdatedAt
  updated!: Date
}
