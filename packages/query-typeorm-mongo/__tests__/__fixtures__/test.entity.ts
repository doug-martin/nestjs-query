import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('testEntities')
export class TestEntity {
  @ObjectIdColumn()
  id!: ObjectID;

  @Column()
  stringType!: string;

  @Column()
  boolType!: boolean;

  @Column()
  numberType!: number;

  @Column()
  dateType!: Date;
}
