import { getQueryServiceToken } from '@nestjs-query/core';
import { instance } from 'ts-mockito';
import { createTypegooseQueryServiceProviders } from '../src/providers';
import { TypegooseQueryService } from '../src/services';

describe('createTypegooseQueryServiceProviders', () => {
  it('should create a provider for the entity', () => {
    class TestEntity {}
    const providers = createTypegooseQueryServiceProviders([TestEntity]);
    expect(providers).toHaveLength(1);
    expect(providers[0].provide).toBe(getQueryServiceToken(TestEntity));
    expect(providers[0].inject).toEqual([`${TestEntity.name}Model`]);
    expect(providers[0].useFactory(instance(() => {}))).toBeInstanceOf(TypegooseQueryService);
  });
});
