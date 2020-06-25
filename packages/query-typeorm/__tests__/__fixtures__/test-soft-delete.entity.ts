import { Column, Entity, DeleteDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class TestSoftDeleteEntity {
  @PrimaryColumn({ name: 'test_entity_pk' })
  testEntityPk!: string;

  @Column({ name: 'string_type' })
  stringType!: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
