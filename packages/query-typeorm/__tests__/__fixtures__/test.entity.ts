import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TestRelation } from './test-relation.entity';

@Entity()
export class TestEntity {
  @PrimaryGeneratedColumn('uuid')
  testEntityPk!: string;

  @Column({ name: 'string_type' })
  stringType!: string;

  @Column({ name: 'bool_type' })
  boolType!: boolean;

  @Column({ name: 'number_type' })
  numberType!: number;

  @Column({ name: 'date_type' })
  dateType!: Date;

  @OneToMany(
    () => TestRelation,
    tr => tr.testEntity,
  )
  testRelations?: TestRelation[];

  @ManyToMany(
    () => TestRelation,
    tr => tr.manyTestEntities,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinTable()
  manyTestRelations?: TestRelation[];

  @OneToOne(
    () => TestRelation,
    relation => relation.oneTestEntity,
  )
  @JoinColumn()
  oneTestRelation?: TestRelation;
}
