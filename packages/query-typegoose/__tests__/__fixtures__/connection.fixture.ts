import { mongoose } from '@typegoose/typegoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { seed } from './seeds'

const { connections } = mongoose
const mongoServer = new MongoMemoryServer()

export function getConnectionUri(): Promise<string> {
  return mongoServer.getUri()
}

export const dropDatabase = async (): Promise<void> => {
  await connections[connections.length - 1].dropDatabase()
}

export const prepareDb = async (): Promise<void> => {
  await seed(connections[connections.length - 1])
}

export const closeDbConnection = async (): Promise<void> => {
  await connections[connections.length - 1].close()
  await mongoServer.stop()
}
