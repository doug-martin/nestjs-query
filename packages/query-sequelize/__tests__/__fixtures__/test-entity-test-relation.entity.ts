import { Column, ForeignKey, Model, Table } from 'sequelize-typescript'

import { TestEntity } from './test.entity'
import { TestRelation } from './test-relation.entity'

@Table({})
export class TestEntityTestRelationEntity extends Model<TestEntityTestRelationEntity> {
  @ForeignKey(() => TestEntity)
  @Column({ field: 'test_entity_id' })
  testEntityId!: number

  @ForeignKey(() => TestRelation)
  @Column({ field: 'test_relation_id' })
  testRelationId!: number
}
