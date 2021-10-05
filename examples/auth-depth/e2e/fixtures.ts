import { Connection } from 'typeorm';
import { executeTruncate } from '../../helpers';
import { UserEntity } from '../src/user/user.entity';
import { ResourceAEntity } from '../src/resource-a/resource-a.entity';
import { ResourceBEntity } from '../src/resource-b/resource-b.entity';
import { ResourceCEntity } from '../src/resource-c/resource-c.entity';

const tables = ['resource_a', 'resource_b', 'resource_c', 'user'];
export const truncate = async (connection: Connection): Promise<void> => executeTruncate(connection, tables);

export const refresh = async (connection: Connection): Promise<void> => {
  await truncate(connection);

  const userRepo = connection.getRepository(UserEntity);
  const resourceARepo = connection.getRepository(ResourceAEntity);
  const resourceBRepo = connection.getRepository(ResourceBEntity);
  const resourceCRepo = connection.getRepository(ResourceCEntity);

  await userRepo.save([{ username: 'nestjs-query', password: '123' }]);

  const resourceA = await resourceARepo.save({});
  const resourceB = await resourceBRepo.save({ resourceAId: resourceA.id.toString() });
  await resourceCRepo.save({ resourceBId: resourceB.id.toString() });
};
