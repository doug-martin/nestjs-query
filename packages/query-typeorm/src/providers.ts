import { Class, getQueryServiceToken } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Connection, ConnectionOptions } from 'typeorm';
import { TypeOrmQueryService } from './services';
import { CustomFilterRegistry, FilterQueryBuilder, WhereBuilder } from './query';
import { getQueryTypeormMetadata } from './common';

function createTypeOrmQueryServiceProvider<Entity>(
  EntityClass: Class<Entity>,
  connection?: Connection | ConnectionOptions | string,
): FactoryProvider {
  return {
    provide: getQueryServiceToken(EntityClass),
    useFactory(repo: Repository<Entity>, customFilterRegistry: CustomFilterRegistry) {
      return new TypeOrmQueryService(repo, {
        filterQueryBuilder: new FilterQueryBuilder<Entity>(
          repo,
          new WhereBuilder<Entity>(getQueryTypeormMetadata(connection), {
            customFilterRegistry,
          }),
        ),
      });
    },
    inject: [getRepositoryToken(EntityClass, connection), CustomFilterRegistry],
  };
}

export const createTypeOrmQueryServiceProviders = (
  entities: Class<unknown>[],
  connection?: Connection | ConnectionOptions | string,
): FactoryProvider[] => entities.map((entity) => createTypeOrmQueryServiceProvider(entity, connection));
