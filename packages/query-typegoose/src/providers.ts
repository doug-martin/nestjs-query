import { AssemblerSerializer, getQueryServiceToken } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { getModelToken } from 'nestjs-typegoose';
import { Document } from 'mongoose';
import { TypegooseQueryService } from './services';
import { isClass } from 'is-class';
import { TypegooseClass, TypegooseClassWithOptions, TypegooseDiscriminator } from './typegoose-interface.helpers';

type ClassOrDiscriminator = TypegooseClassWithOptions | TypegooseDiscriminator;
type TypegooseInput = TypegooseClass | ClassOrDiscriminator;

const isTypegooseClass = (item: TypegooseInput): item is TypegooseClass => isClass(item);

const isTypegooseClassWithOptions = (item: ClassOrDiscriminator): item is TypegooseClassWithOptions => isTypegooseClass(item.typegooseClass);

AssemblerSerializer((obj: Document) => obj.toObject({ virtuals: true }))(Document);

function createTypegooseQueryServiceProvider<Entity extends Base>(model: (TypegooseClass | TypegooseClassWithOptions)): FactoryProvider {
  const convertedClass = convertToTypegooseClass(model);
  if (!convertedClass) {
    throw new Error(`Model definitions ${model} is incorrect.`)
  }
  const modelName = convertedClass.typegooseClass?.name

  return {
    provide: getQueryServiceToken({ name: modelName }),
    useFactory(ModelClass: ReturnModelType<new () => Entity>) {
      // initialize default serializer for documents, this is the type that mongoose returns from queries
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      AssemblerSerializer((obj: DocumentType<unknown>) => obj.toObject({ virtuals: true }))(ModelClass);

      return new TypegooseQueryService(ModelClass);
    },
    inject: [ getModelToken(modelName) ],
  };
}

function convertToTypegooseClass(item: TypegooseInput): ClassOrDiscriminator | undefined {
  if (isTypegooseClass(item)) {
    return { typegooseClass: item };
  } else if (isTypegooseClassWithOptions(item)) {
    return item;
  }
  return undefined;
}

export const createTypegooseQueryServiceProviders = (models: (TypegooseClass | TypegooseClassWithOptions)[]): FactoryProvider[] =>
  models.map((model) => createTypegooseQueryServiceProvider(model));
