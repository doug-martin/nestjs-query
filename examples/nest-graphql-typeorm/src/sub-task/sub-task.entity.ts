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

@Entity()
export class SubTaskEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  completed!: boolean;

  @Column({ nullable: false })
  todoItemId!: string;

  @ManyToOne((): ObjectType<TodoItemEntity> => TodoItemEntity, (td) => td.subTasks, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  todoItem!: TodoItemEntity;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;
}
