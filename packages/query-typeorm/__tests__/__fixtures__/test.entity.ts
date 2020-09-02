import { Column, Entity, OneToMany, ManyToMany, JoinTable, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { TestEntityRelationEntity } from './test-entity-relation.entity';
import { TestRelation } from './test-relation.entity';

@Entity()
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
