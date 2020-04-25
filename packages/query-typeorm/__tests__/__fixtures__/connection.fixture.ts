// this is needed to create a query builder in typeorm :(
import { Connection, createConnection, getConnection } from 'typeorm';
import { TestEntityRelationEntity } from './test-entity-relation.entity';
import { TestRelation } from './test-relation.entity';
import { TestSoftDeleteEntity } from './test-soft-delete.entity';
import { TestEntity } from './test.entity';

export function createTestConnection(): Promise<Connection> {
  return createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [TestEntity, TestSoftDeleteEntity, TestRelation, TestEntityRelationEntity],
    synchronize: true,
    logging: false,
  });
}

export function closeTestConnection(): Promise<void> {
  return getConnection().close();
}

export function getTestConnection(): Connection {
  return getConnection();
}
