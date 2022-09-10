import { Connection } from 'typeorm'

import { executeTruncate } from '../../../helpers'
import { UserEntity } from '../src/user/user.entity'

const tables = ['user']
export const truncate = async (connection: Connection): Promise<void> => executeTruncate(connection, tables)

export const refresh = async (connection: Connection): Promise<void> => {
  await truncate(connection)

  const userRepo = connection.getRepository(UserEntity)
  await userRepo.save([
    { name: 'User 1', email: 'user1@example.com' },
    { name: 'User 2', email: 'user2@example.com' },
    { name: 'User 3', email: 'user3@example.com' }
  ])
}
