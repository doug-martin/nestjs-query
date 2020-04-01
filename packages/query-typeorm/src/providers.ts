import { Class } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Connection, ConnectionOptions } from 'typeorm';
import { getTypeOrmQueryServiceKey } from './decorators';
import { TypeOrmQueryService } from './services';

function createTypeOrmQueryServiceProvider<Entity>(
  EntityClass: Class<Entity>,
  connection?: Connection | ConnectionOptions | string,
): FactoryProvider {
  return {
    provide: getTypeOrmQueryServiceKey(EntityClass),
    useFactory(repo: Repository<Entity>) {
      return new TypeOrmQueryService(repo);
    },
    inject: [getRepositoryToken(EntityClass, connection)],
  };
}

export const createTypeOrmQueryServiceProviders = (
  entities: Class<unknown>[],
  connection?: Connection | ConnectionOptions | string,
): FactoryProvider[] => entities.map((entity) => createTypeOrmQueryServiceProvider(entity, connection));
