import { Connection, createConnection, getConnection, ConnectionOptions } from 'typeorm';
import { TestEntity } from './test.entity';
import { seed } from './seeds';

export const CONNECTION_OPTIONS: ConnectionOptions = {
  type: 'mongodb',
  database: ':memory:',
  dropSchema: true,
  entities: [TestEntity],
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

export const truncate = async (connection: Connection): Promise<void> => {
  await connection.dropDatabase();
};

export const refresh = async (connection: Connection = getConnection()): Promise<void> => {
  await truncate(connection);
  return seed(connection);
};
