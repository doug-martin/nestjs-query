import { DynamicModule } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { TypegooseClassWithOptions, TypegooseClass } from './typegoose-interface.helpers';
import { createTypegooseQueryServiceProviders } from './providers';

export class NestjsQueryTypegooseModule {
  static forFeature(models: (TypegooseClass | TypegooseClassWithOptions)[], connectionName?: string): DynamicModule {
    const queryServiceProviders = createTypegooseQueryServiceProviders(models);
    const typegooseModule = TypegooseModule.forFeature(models, connectionName);
    return {
      imports: [typegooseModule],
      module: NestjsQueryTypegooseModule,
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, typegooseModule]
    };
  }
}
