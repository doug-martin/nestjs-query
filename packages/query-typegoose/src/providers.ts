import { AssemblerDeserializer, AssemblerSerializer, getQueryServiceToken } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';
import { TypegooseQueryService } from './services/typegoose-query-service';

function createTypegooseQueryServiceProvider<Entity extends Base>(model: TypegooseClass): FactoryProvider {
  return {
    provide: getQueryServiceToken(model),
    useFactory(ModelClass: ReturnModelType<new () => Entity>) {
      // initialize default serializer for documents, this is the type that mongoose returns from queries
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      AssemblerSerializer((obj: DocumentType<unknown>) => obj.toObject({ virtuals: true }))(ModelClass);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      AssemblerDeserializer<Entity>((obj: unknown) => new ModelClass(obj))(model);

      return new TypegooseQueryService(ModelClass);
    },
    inject: [`${model.name}Model`],
  };
}

export const createTypegooseQueryServiceProviders = (models: TypegooseClass[]): FactoryProvider[] => {
  return models.map((model) => createTypegooseQueryServiceProvider(model));
};
