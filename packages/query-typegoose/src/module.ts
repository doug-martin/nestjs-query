import { DynamicModule } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { TypegooseClassWithOptions } from 'nestjs-typegoose/dist/typegoose-class.interface';
import { createTypegooseQueryServiceProviders } from './providers';
import { TypegooseClass } from './typegoose-interface.helpers';

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
