import { getRepositoryToken } from '@nestjs/typeorm'
import { getQueryServiceToken } from '@ptc-org/nestjs-query-core'
import { instance, mock } from 'ts-mockito'
import { Repository } from 'typeorm'

import { createTypeOrmQueryServiceProviders } from '../src/providers'
import { TypeOrmQueryService } from '../src/services'

describe('createTypeOrmQueryServiceProviders', () => {
  it('should create a provider for the entity', () => {
    class TestEntity {}

    const mockRepo = mock<Repository<TestEntity>>(Repository)
    const providers = createTypeOrmQueryServiceProviders([TestEntity])
    expect(providers).toHaveLength(1)
    expect(providers[0].provide).toBe(getQueryServiceToken(TestEntity))
    expect(providers[0].inject).toEqual([getRepositoryToken(TestEntity)])
    expect(providers[0].useFactory(instance(mockRepo))).toBeInstanceOf(TypeOrmQueryService)
  })
})
