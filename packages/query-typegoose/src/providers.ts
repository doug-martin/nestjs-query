import { AssemblerSerializer, Class, getQueryServiceToken } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { getModelToken } from 'nestjs-typegoose';
import { TypegooseQueryService } from './services';

function createTypegooseQueryServiceProvider<Entity extends Base>(model: Class<unknown>): FactoryProvider {
  return {
    provide: getQueryServiceToken(model),
    useFactory(ModelClass: ReturnModelType<new () => Entity>) {
      // initialize default serializer for documents, this is the type that mongoose returns from queries
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      AssemblerSerializer((obj: DocumentType<unknown>) => obj.toObject({ virtuals: true }))(ModelClass);

      return new TypegooseQueryService(ModelClass);
    },
    inject: [getModelToken(model.name)],
  };
}

export const createTypegooseQueryServiceProviders = (models: Class<unknown>[]): FactoryProvider[] => {
  return models.map((model) => createTypegooseQueryServiceProvider(model));
};
