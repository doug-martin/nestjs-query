import { Class } from '@codeshine/nestjs-query-core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule } from '@nestjs/common';
import { Connection, ConnectionOptions, ObjectLiteral } from 'typeorm';
import { createTypeOrmQueryServiceProviders } from './providers';

export class NestjsQueryTypeOrmModule {
  static forFeature(
    entities: Class<ObjectLiteral>[],
    connection?: Connection | ConnectionOptions | string,
  ): DynamicModule {
    const queryServiceProviders = createTypeOrmQueryServiceProviders(entities, connection);
    const typeOrmModule = TypeOrmModule.forFeature(entities, connection);
    return {
      imports: [typeOrmModule],
      module: NestjsQueryTypeOrmModule,
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, typeOrmModule],
    };
  }
}
