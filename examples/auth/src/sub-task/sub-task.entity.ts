import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectType,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TodoItemEntity } from '../todo-item/todo-item.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'sub_task' })
export class SubTaskEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  completed!: boolean;

  @Column({ nullable: false })
  ownerId!: string;

  @ManyToOne(() => UserEntity, (u) => u.todoItems, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  owner!: UserEntity;

  @Column({ nullable: false, name: 'todo_item_id' })
  todoItemId!: string;

  @ManyToOne((): ObjectType<TodoItemEntity> => TodoItemEntity, (td) => td.subTasks, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'todo_item_id' })
  todoItem!: TodoItemEntity;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;
}
