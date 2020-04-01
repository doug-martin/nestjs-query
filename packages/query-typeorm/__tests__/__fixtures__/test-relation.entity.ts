import { ManyToOne, Column, PrimaryGeneratedColumn, Entity, JoinColumn, ManyToMany, OneToOne } from 'typeorm';
import { TestEntity } from './test.entity';

@Entity()
export class TestRelation {
  @PrimaryGeneratedColumn('uuid')
  testRelationPk!: string;

  @Column({ name: 'relation_name' })
  relationName!: string;

  @Column({ name: 'test_entity_id' })
  testEntityId?: string;

  @ManyToOne(() => TestEntity, (te) => te.testRelations, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'test_entity_id' })
  testEntity?: TestEntity;

  @ManyToMany(() => TestEntity, (te) => te.manyTestRelations, { onDelete: 'CASCADE', nullable: false })
  manyTestEntities?: TestEntity[];

  @OneToOne(() => TestEntity, (entity) => entity.oneTestRelation)
  oneTestEntity?: TestEntity;
}
