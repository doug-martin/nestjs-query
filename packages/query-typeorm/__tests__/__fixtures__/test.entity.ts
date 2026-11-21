import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { WithTypeormQueryFilter } from '../../src';
import { RadiusCustomFilter, TestEntityTestRelationCountFilter } from './custom-filters.services';
import { TestEntityRelationEntity } from './test-entity-relation.entity';
import { TestRelation } from './test-relation.entity';

@Entity()
// Field level registration
@WithTypeormQueryFilter({
  filter: RadiusCustomFilter,
  fields: ['fakePointType'],
  operations: ['distanceFrom'],
})
@WithTypeormQueryFilter({
  filter: TestEntityTestRelationCountFilter,
  fields: ['pendingTestRelations'],
  operations: ['gt'],
})
export class TestEntity {
  @PrimaryColumn({ name: 'test_entity_pk' })
  testEntityPk!: string;

  @Column({ name: 'string_type' })
  stringType!: string;

  @Column({ name: 'bool_type' })
  boolType!: boolean;

  @Column({ name: 'number_type' })
  numberType!: number;

  @Column({ name: 'date_type' })
  dateType!: Date;

  @OneToMany('TestRelation', 'testEntity')
  testRelations?: TestRelation[];

  @ManyToMany(() => TestRelation, (tr) => tr.manyTestEntities, { onDelete: 'CASCADE', nullable: false })
  @JoinTable()
  manyTestRelations?: TestRelation[];

  @ManyToMany(() => TestRelation, { onDelete: 'CASCADE', nullable: false })
  @JoinTable()
  manyToManyUniDirectional?: TestRelation[];

  @OneToOne(() => TestRelation, (relation) => relation.oneTestEntity)
  @JoinColumn()
  oneTestRelation?: TestRelation;

  @OneToMany(() => TestEntityRelationEntity, (ter) => ter.testEntity)
  testEntityRelation?: TestEntityRelationEntity;
}
