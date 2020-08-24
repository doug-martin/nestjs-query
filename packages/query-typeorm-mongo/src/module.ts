import { Class } from '@nestjs-query/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';
import { createTypeOrmMongoQueryServiceProviders } from './providers';

export class NestjsQueryTypeOrmMongoModule {
  static forFeature(entities: Class<unknown>[], connection?: Connection | ConnectionOptions | string): DynamicModule {
    const queryServiceProviders = createTypeOrmMongoQueryServiceProviders(entities, connection);
    const typeOrmModule = TypeOrmModule.forFeature(entities, connection);
    return {
      imports: [typeOrmModule],
      module: NestjsQueryTypeOrmMongoModule,
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, typeOrmModule],
    };
  }
}
