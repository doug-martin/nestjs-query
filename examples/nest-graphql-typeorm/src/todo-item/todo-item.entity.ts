import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { SubTaskEntity } from '../sub-task/sub-task.entity';
import { TagEntity } from '../tag/tag.entity';

class TodoItemChecklist {
  name!: string;

  completed!: boolean;
}

@Entity()
export class TodoItemEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  completed!: boolean;

  @OneToMany(
    () => SubTaskEntity,
    subTask => subTask.todoItem,
  )
  subTasks!: SubTaskEntity[];

  @Column('jsonb', { nullable: true })
  checklist?: TodoItemChecklist[];

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;

  @ManyToMany(
    () => TagEntity,
    tag => tag.todoItems,
  )
  @JoinTable()
  tags!: TagEntity[];
}
