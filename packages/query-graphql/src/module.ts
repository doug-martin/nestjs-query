import { Class } from '@nestjs-query/core';
import { DynamicModule, ForwardReference, Provider } from '@nestjs/common';
import { AutoResolverOpts, createResolvers } from './providers';

export interface NestjsQueryGraphqlModuleOpts {
  imports: Array<Class<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  services?: Provider[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvers: AutoResolverOpts<any, any, unknown, unknown>[];
}

export class NestjsQueryGraphQLModule {
  static forFeature(opts: NestjsQueryGraphqlModuleOpts): DynamicModule {
    const resolverProviders = createResolvers(opts.resolvers);
    return {
      module: NestjsQueryGraphQLModule,
      imports: [...opts.imports],
      providers: [...(opts.services || []), ...resolverProviders],
      exports: [...resolverProviders, ...opts.imports],
    };
  }
}
