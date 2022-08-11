import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

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
  todoItemId!: number

  @CreateDateColumn()
  created!: Date

  @UpdateDateColumn()
  updated!: Date
}
