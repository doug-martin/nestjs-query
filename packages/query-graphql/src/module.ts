import { DynamicModule } from '@nestjs/common';
import { AutoResolverOpts, createResolvers } from './providers';

export interface NestjsQueryGraphqlModuleOpts {
  imports: DynamicModule[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvers: AutoResolverOpts<any, any, unknown, unknown>[];
}

export class NestjsQueryGraphQLModule {
  static forFeature(opts: NestjsQueryGraphqlModuleOpts): DynamicModule {
    const resolverProviders = createResolvers(opts.resolvers);
    return {
      module: NestjsQueryGraphQLModule,
      imports: [...opts.imports],
      providers: [...resolverProviders],
      exports: [...resolverProviders, ...opts.imports],
    };
  }
}
