import { getQueryServiceToken } from '@nestjs-query/core';
import { getModelToken } from 'nestjs-typegoose';
import { TypegooseQueryService } from '../src/services';
import { createTypegooseQueryServiceProviders } from '../src/providers';

describe('createTypegooseQueryServiceProviders', () => {
  it('should create a provider for the entity', () => {
    class TestEntity {}
    const providers = createTypegooseQueryServiceProviders([TestEntity]);

    expect(providers).toHaveLength(1);
    expect(providers[0].provide).toBe(getQueryServiceToken(TestEntity));
    expect(providers[0].inject).toEqual([getModelToken(TestEntity.name)]);
    expect(providers[0].useFactory(TestEntity)).toBeInstanceOf(TypegooseQueryService);
  });
});
