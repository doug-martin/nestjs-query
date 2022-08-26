import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

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

  @Column({ nullable: true })
  assigneeId?: number

  @CreateDateColumn()
  created!: Date

  @UpdateDateColumn()
  updated!: Date
}
