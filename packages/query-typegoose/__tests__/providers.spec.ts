import { getQueryServiceToken } from '@ptc-org/nestjs-query-core'
import { getModelToken } from '@m8a/nestjs-typegoose'

import { createTypegooseQueryServiceProviders } from '../src/providers'
import { TypegooseQueryService } from '../src/services'

describe('createTypegooseQueryServiceProviders', () => {
  it('should create a provider for the entity', () => {
    class TestEntity {}

    const providers = createTypegooseQueryServiceProviders([TestEntity])

    expect(providers).toHaveLength(1)
    expect(providers[0].provide).toBe(getQueryServiceToken(TestEntity))
    expect(providers[0].inject).toEqual([getModelToken(TestEntity.name)])
    expect(providers[0].useFactory(TestEntity)).toBeInstanceOf(TypegooseQueryService)
  })
})
