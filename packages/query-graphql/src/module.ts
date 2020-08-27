import { Assembler, NestjsQueryCoreModule, Class } from '@nestjs-query/core';
import { DynamicModule, ForwardReference, Provider } from '@nestjs/common';
import { AutoResolverOpts, createAuthServiceProviders, createResolvers } from './providers';
import { ReadResolverOpts } from './resolvers';
import { defaultPubSub, pubSubToken, GraphQLPubSub } from './subscription';
import { PagingStrategies } from './types/query/paging';

export interface NestjsQueryGraphqlModuleOpts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imports: Array<Class<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  services?: Provider[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assemblers?: Class<Assembler<any, any>>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvers: AutoResolverOpts<any, any, unknown, unknown, ReadResolverOpts<unknown>, PagingStrategies>[];
  pubSub?: Provider<GraphQLPubSub>;
}

export class NestjsQueryGraphQLModule {
  static forFeature(opts: NestjsQueryGraphqlModuleOpts): DynamicModule {
    const coreModule = NestjsQueryCoreModule.forFeature({
      assemblers: opts.assemblers,
      imports: opts.imports,
    });
    const pubSubProvider = opts.pubSub ?? this.defaultPubSubProvider();
    const DTOClasses = opts.resolvers.map((r) => r.DTOClass);
    const services = opts.services || [];
    const authServiceProviders = createAuthServiceProviders(DTOClasses);
    const resolverProviders = createResolvers(opts.resolvers);
    return {
      module: NestjsQueryGraphQLModule,
      imports: [...opts.imports, coreModule],
      providers: [...services, ...authServiceProviders, ...resolverProviders, pubSubProvider],
      exports: [
        ...resolverProviders,
        ...services,
        ...authServiceProviders,
        ...opts.imports,
        coreModule,
        pubSubProvider,
      ],
    };
  }

  static defaultPubSubProvider(): Provider<GraphQLPubSub> {
    return { provide: pubSubToken(), useValue: defaultPubSub() };
  }
}
