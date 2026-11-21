import { Class } from '@nestjs-query/core';
import { DynamicModule, Inject, OnModuleInit, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, ConnectionOptions } from 'typeorm';
import { getTypeormEntityQueryFilters, getTypeOrmQueryFilters } from './decorators';
import { createTypeOrmQueryServiceProviders } from './providers';
import { CustomFilterRegistry } from './query';

export const CONFIG_KEY = 'nestjs-query:typeorm:config';

interface NestjsQueryTypeOrmModuleOpts {
  providers?: Provider[];
}

interface NestjsQueryTypeOrmModuleConfig {
  entities: Class<unknown>[];
}

export class NestjsQueryTypeOrmModule implements OnModuleInit {
  constructor(
    @Inject(CONFIG_KEY) private readonly config: NestjsQueryTypeOrmModuleConfig,
    private readonly ref: ModuleRef,
    private readonly customFilterRegistry: CustomFilterRegistry,
  ) {}

  static forFeature(
    entities: Class<unknown>[],
    connection?: Connection | ConnectionOptions | string,
    opts?: NestjsQueryTypeOrmModuleOpts,
  ): DynamicModule {
    const queryServiceProviders = createTypeOrmQueryServiceProviders(entities, connection);
    const typeOrmModule = TypeOrmModule.forFeature(entities, connection);
    return {
      imports: [typeOrmModule],
      module: NestjsQueryTypeOrmModule,
      providers: [
        ...queryServiceProviders,
        ...(opts?.providers ?? []),
        {
          provide: CONFIG_KEY,
          useValue: { entities },
        },
        {
          provide: CustomFilterRegistry,
          useFactory: () => new CustomFilterRegistry(),
        },
      ],
      exports: [...queryServiceProviders, typeOrmModule],
    };
  }

  onModuleInit(): void {
    for (const entity of this.config.entities) {
      const globalCustomFilters = getTypeOrmQueryFilters();
      // Register global (type) custom filters
      for (const cf of globalCustomFilters) {
        if (cf.types && cf.operations) {
          try {
            const instance = this.ref.get(cf.filter);
            this.customFilterRegistry.setFilter(instance, {
              types: cf.types,
              operations: cf.operations,
            });
          } catch (e) {
            // Suppress get errors
            // TODO Only catch UnknownElementException (when nest will expose it)
          }
        }
      }
      // Register entity specific custom filters
      const customFilters = getTypeormEntityQueryFilters(entity);
      if (customFilters.length > 0) {
        for (const cf of customFilters) {
          try {
            const instance = this.ref.get(cf.filter);
            for (const field of cf.fields) {
              this.customFilterRegistry.setFilter(instance, { klass: entity, field, operations: cf.operations });
            }
          } catch (e) {
            // Suppress get errors
            // TODO Only catch UnknownElementException (when nest will expose it)
          }
        }
      }
    }
  }
}
