import { AssemblerDeserializer, AssemblerSerializer } from '@nestjs-query/core';
import { Table, Model, BelongsToMany, BelongsTo, PrimaryKey, Column, ForeignKey } from 'sequelize-typescript';
import { TestEntityTestRelationEntity } from './test-entity-test-relation.entity';
import { TestEntity } from './test.entity';

@AssemblerSerializer((instance: TestRelation) => instance.get({ plain: true }))
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@AssemblerDeserializer((obj: object) => TestRelation.build(obj))
@Table({})
export class TestRelation extends Model<TestRelation> {
  @PrimaryKey
  @Column('uuid')
  testRelationPk!: string;

  @Column({ field: 'relation_name' })
  relationName!: string;

  @ForeignKey(() => TestEntity)
  @Column({ field: 'test_entity_id' })
  testEntityId?: string;

  @BelongsTo(() => TestEntity)
  testEntity?: TestEntity;

  @BelongsToMany(() => TestEntity, () => TestEntityTestRelationEntity)
  manyTestEntities?: TestEntity[];

  @BelongsTo(() => TestEntity)
  oneTestEntity?: TestEntity;
}
