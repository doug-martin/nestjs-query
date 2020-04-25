import { Column, Entity, PrimaryGeneratedColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class TestSoftDeleteEntity {
  @PrimaryGeneratedColumn('uuid')
  testEntityPk!: string;

  @Column({ name: 'string_type' })
  stringType!: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
