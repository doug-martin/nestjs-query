import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TodoItemEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  completed: boolean;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  created!: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  updated!: Date;
}
