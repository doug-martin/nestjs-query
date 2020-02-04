import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SubTaskEntity } from '../sub-task/sub-task.entity';

@Entity()
export class TodoItemEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  title!: string;

  @Column()
  completed!: boolean;

  @OneToMany(
    () => SubTaskEntity,
    subTask => subTask.todoItem,
  )
  subTasks!: SubTaskEntity[];

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;
}
