import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { SubTaskEntity } from '../sub-task/sub-task.entity'
import { TagEntity } from '../tag/tag.entity'
import { UserEntity } from '../user/user.entity'

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

  @Column({ nullable: false })
  ownerId!: string

  @ManyToOne(() => UserEntity, (u) => u.todoItems, {
    onDelete: 'CASCADE',
    nullable: false
  })
  owner!: UserEntity

  @OneToMany(() => SubTaskEntity, (subTask) => subTask.todoItem)
  subTasks!: SubTaskEntity[]

  @CreateDateColumn()
  created!: Date

  @UpdateDateColumn()
  updated!: Date

  @ManyToMany(() => TagEntity, (tag) => tag.todoItems)
  @JoinTable()
  tags!: TagEntity[]

  @Column({ type: 'integer', nullable: false, default: 0 })
  priority!: number

  @Column({ nullable: true })
  createdBy?: string

  @Column({ nullable: true })
  updatedBy?: string
}
