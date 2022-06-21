import { AssemblerSerializer, AssemblerDeserializer, getQueryServiceToken } from '@ptc-org/nestjs-query-core';
import { FactoryProvider } from '@nestjs/common';
import { ModelCtor, Model, SequelizeOptions } from 'sequelize-typescript';
import { getModelToken } from '@nestjs/sequelize';
import { SequelizeQueryService } from './services';
import { MakeNullishOptional } from 'sequelize/types/utils';

function createSequelizeQueryServiceProvider<Entity extends Model>(
  EntityClass: ModelCtor<Entity>,
  connection?: SequelizeOptions | string
): FactoryProvider {
  return {
    provide: getQueryServiceToken(EntityClass),
    useFactory(entity: ModelCtor<Entity>) {
      AssemblerSerializer<Entity>((instance) => instance.get({ plain: true }) as Entity)(entity);
      // eslint-disable-next-line @typescript-eslint/ban-types
      AssemblerDeserializer<Entity>((obj: MakeNullishOptional<Entity>) => entity.build(obj))(entity);
      return new SequelizeQueryService(entity);
    },
    inject: [getModelToken(EntityClass, connection)]
  };
}

export const createSequelizeQueryServiceProviders = (
  entities: ModelCtor[],
  connection?: SequelizeOptions | string
): FactoryProvider[] => entities.map((entity) => createSequelizeQueryServiceProvider(entity, connection));
