import { ManyToOne, Column, Entity, JoinColumn, ManyToMany, OneToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { TestEntityRelationEntity } from './test-entity-relation.entity';
import { TestEntity } from './test.entity';
import { RelationOfTestRelationEntity } from './relation-of-test-relation.entity';

@Entity()
export class TestRelation {
  @PrimaryColumn({ name: 'test_relation_pk' })
  testRelationPk!: string;

  @Column({ name: 'relation_name' })
  relationName!: string;

  @Column({ name: 'test_entity_id', nullable: true })
  testEntityId?: string;

  @Column({ name: 'uni_directional_test_entity_id', nullable: true })
  uniDirectionalTestEntityId?: string;

  @ManyToOne(() => TestEntity, (te) => te.testRelations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_entity_id' })
  testEntity?: TestEntity;

  @ManyToOne(() => TestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uni_directional_test_entity_id' })
  testEntityUniDirectional?: TestEntity;

  @ManyToMany(() => TestEntity, (te) => te.manyTestRelations, { onDelete: 'CASCADE', nullable: false })
  manyTestEntities?: TestEntity[];

  @OneToOne(() => TestEntity, (entity) => entity.oneTestRelation)
  oneTestEntity?: TestEntity;

  @OneToMany(() => TestEntityRelationEntity, (ter) => ter.testRelation)
  testEntityRelation?: TestEntityRelationEntity;

  @OneToMany(() => RelationOfTestRelationEntity, (ter) => ter.testRelation)
  relationsOfTestRelation?: RelationOfTestRelationEntity;

  @Column({ name: 'uni_directional_relation_test_entity_id', nullable: true })
  relationOfTestRelationId?: string;

  @ManyToOne(() => RelationOfTestRelationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uni_directional_relation_test_entity_id' })
  relationOfTestRelation?: RelationOfTestRelationEntity;
}
