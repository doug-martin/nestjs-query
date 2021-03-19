import { AssemblerDeserializer, AssemblerSerializer } from '@nestjs-query/core';
import { Table, Model, BelongsToMany, BelongsTo, PrimaryKey, Column, ForeignKey } from 'sequelize-typescript';
import { TestEntityTestRelationEntity } from './test-entity-test-relation.entity';
import { TestEntity } from './test.entity';

@AssemblerSerializer((instance: TestRelation) => instance.get({ plain: true }))
// eslint-disable-next-line @typescript-eslint/no-use-before-define,@typescript-eslint/ban-types
@AssemblerDeserializer((obj: object) => TestRelation.build(obj))
@Table({ timestamps: false })
export class TestRelation extends Model<TestRelation, Partial<TestRelation>> {
  @PrimaryKey
  @Column
  testRelationPk!: string;

  @Column({ field: 'relation_name' })
  relationName!: string;

  @ForeignKey(() => TestEntity)
  @Column({ field: 'test_entity_id' })
  testEntityId?: string;

  @BelongsTo(() => TestEntity, 'testEntityId')
  testEntity?: TestEntity;

  @BelongsToMany(() => TestEntity, () => TestEntityTestRelationEntity)
  manyTestEntities?: TestEntity[];

  @BelongsTo(() => TestEntity, 'oneTestEntityId')
  oneTestEntity?: TestEntity;
}
