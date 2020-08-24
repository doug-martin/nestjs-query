import { Connection, getConnection } from 'typeorm';
import { ObjectID } from 'mongodb';
import { TestEntity } from './test.entity';

export const TEST_ENTITIES: TestEntity[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
  return {
    id: new ObjectID(),
    boolType: i % 2 === 0,
    dateType: new Date(`2020-02-${i}`),
    numberType: i,
    stringType: `foo${i}`,
  };
});

export const seed = async (connection: Connection = getConnection()): Promise<void> => {
  const testEntityRepo = connection.getRepository(TestEntity);
  await testEntityRepo.save(TEST_ENTITIES);
};
