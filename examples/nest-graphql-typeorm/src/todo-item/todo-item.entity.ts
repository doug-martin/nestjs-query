import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TodoItemEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  title!: string;

  @Column()
  completed!: boolean;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;
}
