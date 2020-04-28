import { AssemblerDeserializer, AssemblerSerializer } from '@nestjs-query/core';
import { Table, PrimaryKey, Column, BelongsToMany, HasMany, HasOne, Model } from 'sequelize-typescript';
import { TestEntityTestRelationEntity } from './test-entity-test-relation.entity';
import { TestRelation } from './test-relation.entity';

@AssemblerSerializer((instance: TestEntity) => instance.get({ plain: true }))
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@AssemblerDeserializer((obj: object) => TestEntity.build(obj))
@Table({})
export class TestEntity extends Model<TestEntity> {
  @PrimaryKey
  @Column('uuid')
  testEntityPk!: string;

  @Column({ field: 'string_type' })
  stringType!: string;

  @Column({ field: 'bool_type' })
  boolType!: boolean;

  @Column({ field: 'number_type' })
  numberType!: number;

  @Column({ field: 'date_type' })
  dateType!: Date;

  @HasMany(() => TestRelation)
  testRelations?: TestRelation[];

  @BelongsToMany(() => TestRelation, () => TestEntityTestRelationEntity)
  manyTestRelations?: TestRelation[];

  @HasOne(() => TestRelation)
  oneTestRelation?: TestRelation;
}
