import { DynamicModule } from '@nestjs/common';
import { TypegooseModule, TypegooseClass, TypegooseClassWithOptions } from 'nestjs-typegoose';
import { Class } from '@nestjs-query/core';
import { createTypegooseQueryServiceProviders } from './providers';

export class NestjsQueryTypegooseModule {
  static forFeature(models: (TypegooseClass | TypegooseClassWithOptions)[], connectionName?: string): DynamicModule {
    const queryServiceProviders = createTypegooseQueryServiceProviders(models);
    const typegooseModule = TypegooseModule.forFeature(models, connectionName);
    return {
      imports: [typegooseModule],
      module: NestjsQueryTypegooseModule,
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, typegooseModule],
    };
  }
}
