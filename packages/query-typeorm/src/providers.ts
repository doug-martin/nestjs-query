import { Class, getQueryServiceToken } from '@codeshine/nestjs-query-core';
import { FactoryProvider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Connection, ConnectionOptions, ObjectLiteral } from 'typeorm';
import { TypeOrmQueryService } from './services';

function createTypeOrmQueryServiceProvider<Entity extends ObjectLiteral>(
  EntityClass: Class<Entity>,
  connection?: Connection | ConnectionOptions | string,
): FactoryProvider {
  return {
    provide: getQueryServiceToken(EntityClass),
    useFactory(repo: Repository<Entity>) {
      return new TypeOrmQueryService(repo);
    },
    inject: [getRepositoryToken(EntityClass, connection)],
  };
}

export const createTypeOrmQueryServiceProviders = (
  entities: Class<ObjectLiteral>[],
  connection?: Connection | ConnectionOptions | string,
): FactoryProvider[] =>
  entities.map((entity) => {
    return createTypeOrmQueryServiceProvider(entity, connection);
  });
