import { getQueryServiceToken } from '@nestjs-query/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createConnection, Repository } from 'typeorm';
import { instance, mock } from 'ts-mockito';
import { createTypeOrmQueryServiceProviders } from '../src/providers';
import { TypeOrmQueryService } from '../src/services';
import { CustomFilterRegistry } from '../src/query';

describe('createTypeOrmQueryServiceProviders', () => {
  it('should create a provider for the entity', async () => {
    class TestEntity {}

    // We need a connection in order to extract entity metadata
    const conn = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [TestEntity],
      synchronize: true,
      logging: false,
    });
    const mockRepo = mock<Repository<TestEntity>>(Repository);
    const providers = createTypeOrmQueryServiceProviders([TestEntity], conn);
    expect(providers).toHaveLength(1);
    expect(providers[0].provide).toBe(getQueryServiceToken(TestEntity));
    expect(providers[0].inject).toEqual([getRepositoryToken(TestEntity), CustomFilterRegistry]);
    expect(providers[0].useFactory(instance(mockRepo))).toBeInstanceOf(TypeOrmQueryService);

    await conn.close();
  });
});
