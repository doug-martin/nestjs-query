import { Class, getQueryServiceToken } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository, Connection, ConnectionOptions } from 'typeorm';
import { TypeOrmMongoQueryService } from './services';

function createTypeOrmMongoQueryServiceProvider<Entity>(
  EntityClass: Class<Entity>,
  connection?: Connection | ConnectionOptions | string,
): FactoryProvider {
  return {
    provide: getQueryServiceToken(EntityClass),
    useFactory(repo: MongoRepository<Entity>) {
      return new TypeOrmMongoQueryService(repo);
    },
    inject: [getRepositoryToken(EntityClass, connection)],
  };
}

export const createTypeOrmMongoQueryServiceProviders = (
  entities: Class<unknown>[],
  connection?: Connection | ConnectionOptions | string,
): FactoryProvider[] => entities.map((entity) => createTypeOrmMongoQueryServiceProvider(entity, connection));
