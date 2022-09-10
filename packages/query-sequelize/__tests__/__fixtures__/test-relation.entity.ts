import { AssemblerDeserializer, AssemblerSerializer } from '@ptc-org/nestjs-query-core'
import { BelongsTo, BelongsToMany, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'

import { TestEntity } from './test.entity'
import { TestEntityTestRelationEntity } from './test-entity-test-relation.entity'

@AssemblerSerializer((instance: TestRelation) => instance.get({ plain: true }))
// eslint-disable-next-line @typescript-eslint/no-use-before-define,@typescript-eslint/ban-types
@AssemblerDeserializer((obj: object) => TestRelation.build(obj))
@Table({ timestamps: false })
export class TestRelation extends Model<TestRelation, Partial<TestRelation>> {
  @PrimaryKey
  @Column
  testRelationPk!: string

  @Column({ field: 'relation_name' })
  relationName!: string

  @ForeignKey(() => TestEntity)
  @Column({ field: 'test_entity_id' })
  testEntityId?: string

  @BelongsTo(() => TestEntity, 'testEntityId')
  testEntity?: TestEntity

  @BelongsToMany(() => TestEntity, () => TestEntityTestRelationEntity)
  manyTestEntities?: TestEntity[]

  @BelongsTo(() => TestEntity, 'oneTestEntityId')
  oneTestEntity?: TestEntity
}
