import { Entity, DeleteDateColumn, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class TestSoftDeleteRelation {
  @PrimaryColumn({ name: 'test_entity_pk' })
  testEntityPk!: string;

  @Column({ name: 'string_type' })
  stringType!: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
