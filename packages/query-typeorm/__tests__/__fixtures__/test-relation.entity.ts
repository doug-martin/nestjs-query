import { ManyToOne, Column, PrimaryGeneratedColumn, Entity, JoinColumn } from 'typeorm';
import { TestEntity } from './test.entity';

@Entity()
export class TestRelation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'relation_name' })
  relationName!: string;

  @Column({ name: 'test_entity_id' })
  testEntityId!: string;

  @ManyToOne(
    () => TestEntity,
    te => te.testRelations,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'test_entity_id' })
  testEntity?: Date;
}
