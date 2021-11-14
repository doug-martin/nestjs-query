import { connections } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seed } from './seeds';

let mongoServer: Promise<MongoMemoryServer> | null = null;

const getServer = (): Promise<MongoMemoryServer> => {
  if (mongoServer === null) {
    mongoServer = MongoMemoryServer.create();
  }
  return mongoServer;
};

export async function getConnectionUri(): Promise<string> {
  return (await getServer()).getUri();
}

export const dropDatabase = async (): Promise<void> => {
  await connections[connections.length - 1].dropDatabase();
};

export const prepareDb = async (): Promise<void> => {
  await seed(connections[connections.length - 1]);
};

export const closeDbConnection = async (): Promise<void> => {
  await connections[connections.length - 1].close();
  await (await getServer()).stop();
};
