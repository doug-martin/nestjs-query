import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { SubTaskEntity } from '../sub-task/sub-task.entity'
import { TagEntity } from '../tag/tag.entity'

@Entity({ name: 'todo_item' })
export class TodoItemEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column({ nullable: true })
  description?: string

  @Column()
  completed!: boolean

  @OneToMany(() => SubTaskEntity, (subTask) => subTask.todoItem)
  subTasks!: SubTaskEntity[]

  @CreateDateColumn()
  created!: Date

  @UpdateDateColumn()
  updated!: Date

  @ManyToMany(() => TagEntity, (tag) => tag.todoItems)
  @JoinTable()
  tags!: TagEntity[]
}
