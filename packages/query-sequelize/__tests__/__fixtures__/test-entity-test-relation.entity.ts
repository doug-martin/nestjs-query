import { Model, Table, ForeignKey, Column } from 'sequelize-typescript';
import { TestRelation } from './test-relation.entity';
import { TestEntity } from './test.entity';

@Table({})
export class TestEntityTestRelationEntity extends Model<TestEntityTestRelationEntity> {
  @ForeignKey(() => TestEntity)
  @Column({ field: 'test_entity_id' })
  testEntityId!: number;

  @ForeignKey(() => TestRelation)
  @Column({ field: 'test_relation_id' })
  testRelationId!: number;
}
