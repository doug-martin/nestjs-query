import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, JoinTable } from 'typeorm';
import { TodoItemEntity } from '../todo-item/todo-item.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column({ nullable: true })
  password?: string;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;

  @OneToMany(() => TodoItemEntity, (todo) => todo.owner)
  @JoinTable()
  todoItems!: TodoItemEntity[];
}
