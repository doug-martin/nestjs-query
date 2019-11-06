import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'string_type' })
  stringType!: string;

  @Column({ name: 'bool_type' })
  boolType!: boolean;

  @Column({ name: 'number_type' })
  numberType!: number;

  @Column({ name: 'date_type' })
  dateType!: Date;
}

