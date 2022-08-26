import { Column, CreateDateColumn, Entity, ManyToMany, ObjectType, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

import { TodoItemEntity } from '../todo-item/todo-item.entity'

@Entity({ name: 'tag' })
export class TagEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @CreateDateColumn()
  created!: Date

  @UpdateDateColumn()
  updated!: Date

  @ManyToMany((): ObjectType<TodoItemEntity> => TodoItemEntity, (td) => td.tags)
  todoItems!: TodoItemEntity[]
}
