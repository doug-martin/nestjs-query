import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'

import { TestEntity } from './test.entity'
import { TestRelation } from './test-relation.entity'

@Entity()
export class TestEntityRelationEntity {
  @PrimaryColumn({ name: 'test_relation_id' })
  testRelationId!: string

  @PrimaryColumn({ name: 'test_entity_id' })
  testEntityId!: string

  @ManyToOne(() => TestRelation, (tr) => tr.testEntityRelation)
  @JoinColumn({ name: 'test_relation_id' })
  testRelation?: TestRelation

  @ManyToOne(() => TestEntity, (te) => te.testEntityRelation)
  @JoinColumn({ name: 'test_entity_id' })
  testEntity?: TestEntity
}
