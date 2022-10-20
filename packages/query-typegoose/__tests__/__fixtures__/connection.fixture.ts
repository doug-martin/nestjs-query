import { MongoMemoryServer } from 'mongodb-memory-server'
import { connections } from 'mongoose'

import { seed } from './seeds'

export type MongoServer = {
  getConnectionUri: () => string
  dropDatabase: () => Promise<void>
  prepareDb: () => Promise<void>
  closeDbConnection: () => Promise<void>
}

export const mongoServer = async (): Promise<MongoServer> => {
  const mongod = await MongoMemoryServer.create()

  return {
    getConnectionUri: (): string => {
      return mongod.getUri()
    },

    dropDatabase: async (): Promise<void> => {
      await connections[connections.length - 1].dropDatabase()
    },

    prepareDb: async (): Promise<void> => {
      await seed(connections[connections.length - 1])
    },

    closeDbConnection: async (): Promise<void> => {
      await connections[connections.length - 1].close()
      await mongod.stop()
    }
  }
}
