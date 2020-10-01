import { AssemblerDeserializer, Class, getQueryServiceToken } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { ModelDefinition } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { MongooseQueryService } from './services';

export type NestjsQueryModelDefinition<Entity extends Document> = {
  document: Class<Entity>;
} & ModelDefinition;

function createMongooseQueryServiceProvider<Entity extends Document>(
  model: NestjsQueryModelDefinition<Entity>,
): FactoryProvider {
  return {
    provide: getQueryServiceToken(model.document),
    useFactory(ModelClass: Model<Entity>) {
      AssemblerDeserializer<Entity>((obj: unknown) => new ModelClass(obj))(model.document);
      // eslint-disable-next-line @typescript-eslint/ban-types
      return new MongooseQueryService<Entity>(ModelClass);
    },
    inject: [`${model.name}Model`],
  };
}

export const createMongooseQueryServiceProviders = (
  models: NestjsQueryModelDefinition<Document>[],
): FactoryProvider[] => {
  return models.map((model) => createMongooseQueryServiceProvider(model));
};
