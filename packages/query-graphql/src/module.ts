import { Assembler, NestjsQueryCoreModule, Class } from '@nestjs-query/core';
import { DynamicModule, ForwardReference, Provider } from '@nestjs/common';
import { AutoResolverOpts, createResolvers } from './providers';

export interface NestjsQueryGraphqlModuleOpts {
  imports: Array<Class<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  services?: Provider[];
  assemblers?: Class<Assembler<any, any>>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvers: AutoResolverOpts<any, any, unknown, unknown>[];
}

export class NestjsQueryGraphQLModule {
  static forFeature(opts: NestjsQueryGraphqlModuleOpts): DynamicModule {
    const coreModule = NestjsQueryCoreModule.forFeature({
      assemblers: opts.assemblers,
      imports: opts.imports,
    });
    const services = opts.services || [];
    const resolverProviders = createResolvers(opts.resolvers);
    return {
      module: NestjsQueryGraphQLModule,
      imports: [...opts.imports, coreModule],
      providers: [...services, ...resolverProviders],
      exports: [...resolverProviders, ...services, ...opts.imports, coreModule],
    };
  }
}
