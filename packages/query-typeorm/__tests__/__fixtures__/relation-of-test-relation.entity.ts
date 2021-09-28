import { ManyToOne, Column, Entity, JoinColumn, PrimaryColumn } from 'typeorm';
import { TestRelation } from './test-relation.entity';

@Entity()
export class RelationOfTestRelationEntity {
  @PrimaryColumn({ name: 'test_relation_pk' })
  id!: string;

  @Column({ name: 'relation_name' })
  relationName!: string;

  @Column({ name: 'test_relation_id' })
  testRelationId!: string;

  @ManyToOne(() => TestRelation, (tr) => tr.testEntityRelation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_relation_id' })
  testRelation!: TestRelation;
}
