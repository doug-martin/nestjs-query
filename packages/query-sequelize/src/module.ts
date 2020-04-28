import { DynamicModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModelCtor, SequelizeOptions } from 'sequelize-typescript';
import { createSequelizeQueryServiceProviders } from './providers';

export class NestjsQuerySequelizeModule {
  static forFeature(entities: ModelCtor[], connection?: SequelizeOptions | string): DynamicModule {
    const queryServiceProviders = createSequelizeQueryServiceProviders(entities, connection);
    const nestjsSequelize = SequelizeModule.forFeature(entities);
    return {
      module: NestjsQuerySequelizeModule,
      imports: [nestjsSequelize],
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, nestjsSequelize],
    };
  }
}
