import { getQueryServiceToken } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { ModelDefinition } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { MongooseQueryService } from './services/mongoose-query.service';

function createMongooseQueryServiceProvider<Entity extends Document>(model: ModelDefinition): FactoryProvider {
  return {
    provide: getQueryServiceToken({ name: model.name }),
    useFactory(modelClass: Model<Entity>) {
      return new MongooseQueryService<Entity>(modelClass);
    },
    inject: [`${model.name}Model`],
  };
}

export const createMongooseQueryServiceProviders = (models: ModelDefinition[]): FactoryProvider[] =>
  models.map((model) => createMongooseQueryServiceProvider(model));
