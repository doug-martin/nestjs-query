import { Assembler, NestjsQueryCoreModule, Class } from '@nestjs-query/core';
import { DynamicModule, ForwardReference, Provider } from '@nestjs/common';
import { AutoResolverOpts, createAuthorizerProviders, createHookProviders, createResolvers } from './providers';
import { ReadResolverOpts } from './resolvers';
import { defaultPubSub, pubSubToken, GraphQLPubSub } from './subscription';
import { PagingStrategies } from './types/query/paging';

interface DTOModuleOpts<DTO> {
  DTOClass: Class<DTO>;
  CreateDTOClass?: Class<DTO>;
  UpdateDTOClass?: Class<DTO>;
}

export interface NestjsQueryGraphqlModuleOpts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imports: Array<Class<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  services?: Provider[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assemblers?: Class<Assembler<any, any, any, any, any, any>>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvers?: AutoResolverOpts<any, any, unknown, unknown, ReadResolverOpts<any>, PagingStrategies>[];
  dtos?: DTOModuleOpts<unknown>[];
  pubSub?: Provider<GraphQLPubSub>;
}

export class NestjsQueryGraphQLModule {
  static forFeature(opts: NestjsQueryGraphqlModuleOpts): DynamicModule {
    const coreModule = this.getCoreModule(opts);
    const providers = this.getProviders(opts);
    return {
      module: NestjsQueryGraphQLModule,
      imports: [...opts.imports, coreModule],
      providers: [...providers],
      exports: [...providers, ...opts.imports, coreModule],
    };
  }

  static defaultPubSubProvider(): Provider<GraphQLPubSub> {
    return { provide: pubSubToken(), useValue: defaultPubSub() };
  }

  private static getCoreModule(opts: NestjsQueryGraphqlModuleOpts): DynamicModule {
    return NestjsQueryCoreModule.forFeature({
      assemblers: opts.assemblers,
      imports: opts.imports,
    });
  }

  private static getProviders(opts: NestjsQueryGraphqlModuleOpts): Provider<unknown>[] {
    return [
      ...this.getServicesProviders(opts),
      ...this.getPubSubProviders(opts),
      ...this.getAuthorizerProviders(opts),
      ...this.getHookProviders(opts),
      ...this.getResolverProviders(opts),
    ];
  }

  private static getPubSubProviders(opts: NestjsQueryGraphqlModuleOpts): Provider<GraphQLPubSub>[] {
    return [opts.pubSub ?? this.defaultPubSubProvider()];
  }

  private static getServicesProviders(opts: NestjsQueryGraphqlModuleOpts): Provider<unknown>[] {
    return opts.services ?? [];
  }

  private static getResolverProviders(opts: NestjsQueryGraphqlModuleOpts): Provider<unknown>[] {
    return createResolvers(opts.resolvers ?? []);
  }

  private static getAuthorizerProviders(opts: NestjsQueryGraphqlModuleOpts): Provider<unknown>[] {
    const resolverDTOs = opts.resolvers?.map((r) => r.DTOClass) ?? [];
    const dtos = opts.dtos?.map((o) => o.DTOClass) ?? [];
    return createAuthorizerProviders([...resolverDTOs, ...dtos]);
  }

  private static getHookProviders(opts: NestjsQueryGraphqlModuleOpts): Provider<unknown>[] {
    return createHookProviders([...(opts.resolvers ?? []), ...(opts.dtos ?? [])]);
  }
}
