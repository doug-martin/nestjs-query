import { getQueryServiceToken } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';
import { TypegooseQueryService } from './services';

function createTypegooseQueryServiceProvider<Entity>(model: TypegooseClass): FactoryProvider {
  return {
    provide: getQueryServiceToken(model),
    useFactory(modelClass: ReturnModelType<new () => Entity>) {
      return new TypegooseQueryService(modelClass);
    },
    inject: [`${model.name}Model`],
  };
}

export const createTypegooseQueryServiceProviders = (models: TypegooseClass[]): FactoryProvider[] =>
  models.map((model) => createTypegooseQueryServiceProvider(model));
