import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  ObjectType,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { TodoItemEntity } from '../todo-item/todo-item.entity'

@Entity({ name: 'sub_task' })
export class SubTaskEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column({ nullable: true })
  description?: string

  @Column()
  completed!: boolean

  @Column({ nullable: false, name: 'todo_item_id' })
  todoItemId!: string

  @ManyToOne((): ObjectType<TodoItemEntity> => TodoItemEntity, (td) => td.subTasks, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'todo_item_id' })
  todoItem!: TodoItemEntity

  @CreateDateColumn()
  created!: Date

  @UpdateDateColumn()
  updated!: Date
}
