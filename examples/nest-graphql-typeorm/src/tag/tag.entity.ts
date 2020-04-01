import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectType,
  ManyToMany,
} from 'typeorm';
import { TodoItemEntity } from '../todo-item/todo-item.entity';

@Entity()
export class TagEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;

  @ManyToMany((): ObjectType<TodoItemEntity> => TodoItemEntity, (td) => td.tags)
  todoItems!: TodoItemEntity[];
}
