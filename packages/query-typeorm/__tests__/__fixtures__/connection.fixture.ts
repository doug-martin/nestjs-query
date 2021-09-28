// this is needed to create a query builder in typeorm :(
import { Connection, createConnection, getConnection, ConnectionOptions } from 'typeorm';
import { TestEntityRelationEntity } from './test-entity-relation.entity';
import { TestRelation } from './test-relation.entity';
import { TestSoftDeleteEntity } from './test-soft-delete.entity';
import { TestEntity } from './test.entity';
import { seed } from './seeds';
import { RelationOfTestRelationEntity } from './relation-of-test-relation.entity';

export const CONNECTION_OPTIONS: ConnectionOptions = {
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  entities: [TestEntity, TestSoftDeleteEntity, TestRelation, TestEntityRelationEntity, RelationOfTestRelationEntity],
  synchronize: true,
  logging: false,
};

export function createTestConnection(): Promise<Connection> {
  return createConnection(CONNECTION_OPTIONS);
}

export function closeTestConnection(): Promise<void> {
  return getConnection().close();
}

export function getTestConnection(): Connection {
  return getConnection();
}

const tables = [
  'test_entity',
  'relation_of_test_relation_entity',
  'test_relation',
  'test_entity_relation_entity',
  'test_soft_delete_entity',
  'test_entity_many_test_relations_test_relation',
];
export const truncate = async (connection: Connection): Promise<void> => {
  await tables.reduce(async (prev, table) => {
    await prev;
    await connection.query(`DELETE FROM ${table}`);
  }, Promise.resolve());
};

export const refresh = async (connection: Connection = getConnection()): Promise<void> => {
  await truncate(connection);
  return seed(connection);
};
