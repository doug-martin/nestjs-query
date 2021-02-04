import { getQueryServiceToken } from '@nestjs-query/core';
import { instance } from 'ts-mockito';
import { Document } from 'mongoose';
import { createMongooseQueryServiceProviders } from '../src/providers';
import { MongooseQueryService } from '../src/services';

describe('createTypegooseQueryServiceProviders', () => {
  it('should create a provider for the entity', () => {
    class TestEntity extends Document {}
    const providers = createMongooseQueryServiceProviders([
      { document: TestEntity, name: TestEntity.name, schema: null },
    ]);
    expect(providers).toHaveLength(1);
    expect(providers[0].provide).toBe(getQueryServiceToken(TestEntity));
    expect(providers[0].inject).toEqual([`${TestEntity.name}Model`]);
    expect(providers[0].useFactory(instance(() => {}))).toBeInstanceOf(MongooseQueryService);
  });
});
