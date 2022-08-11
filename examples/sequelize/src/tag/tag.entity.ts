import { AutoIncrement, BelongsToMany, Column, CreatedAt, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript'

import { TodoItemEntity } from '../todo-item/entity/todo-item.entity'
import { TodoItemEntityTags } from '../todo-item/entity/todo-item-tag.entity'

@Table({})
export class TagEntity extends Model<TagEntity, Partial<TagEntity>> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number

  @Column
  name!: string

  @CreatedAt
  created!: Date

  @UpdatedAt
  updated!: Date

  @BelongsToMany(() => TodoItemEntity, () => TodoItemEntityTags)
  todoItems!: TodoItemEntity[]
}
