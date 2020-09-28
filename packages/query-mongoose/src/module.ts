import { DynamicModule } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { createMongooseQueryServiceProviders } from './providers';

export class NestjsQueryMongooseModule {
  static forFeature(models: ModelDefinition[], connectionName?: string): DynamicModule {
    const queryServiceProviders = createMongooseQueryServiceProviders(models);
    const mongooseModule = MongooseModule.forFeature(models, connectionName);
    return {
      imports: [mongooseModule],
      module: NestjsQueryMongooseModule,
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, mongooseModule],
    };
  }
}
