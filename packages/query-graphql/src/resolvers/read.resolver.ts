import { Class, mergeQuery, QueryService } from '@nestjs-query/core';
import { ArgsType, Context, Resolver } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { OffsetConnectionOptions } from '../types/connection/offset';
import { getDTONames } from '../common';
import { HookArgs, ResolverQuery } from '../decorators';
import {
  ConnectionType,
  FindOneArgsType,
  QueryArgsType,
  QueryArgsTypeOpts,
  StaticConnectionType,
  StaticQueryArgsType,
} from '../types';
import { CursorConnectionOptions } from '../types/connection/cursor';
import { CursorQueryArgsTypeOpts } from '../types/query/query-args';
import {
  BaseServiceResolver,
  ConnectionTypeFromOpts,
  QueryArgsFromOpts,
  ResolverClass,
  ResolverOpts,
  ServiceResolver,
} from './resolver.interface';
import { extractConnectionOptsFromQueryArgs, getAuthFilter } from './helpers';
import { HookInterceptor } from '../interceptors';
import { HookTypes } from '../hooks';


export type ReadResolverFromOpts<
  DTO,
  Opts extends ReadResolverOpts<DTO>,
  QS extends QueryService<DTO, unknown, unknown>
> = ReadResolver<DTO, QueryArgsFromOpts<DTO, Opts>, ConnectionTypeFromOpts<DTO, Opts>, QS>;

export type ReadResolverOpts<DTO> = {
  QueryArgs?: StaticQueryArgsType<DTO>;
  Connection?: StaticConnectionType<DTO>;
} & ResolverOpts &
  QueryArgsTypeOpts<DTO> &
  Pick<CursorConnectionOptions | OffsetConnectionOptions, 'enableTotalCount'>;

export interface ReadResolver<
  DTO,
  QT extends QueryArgsType<DTO>,
  CT extends ConnectionType<DTO>,
  QS extends QueryService<DTO, unknown, unknown>
> extends ServiceResolver<DTO, QS> {
  queryMany(query: QT, context?: unknown): Promise<CT>;
  findById(id: FindOneArgsType, context?: unknown): Promise<DTO | undefined>;
}

/**
 * @internal
 * Mixin to add `read` graphql endpoints.
 */
export const Readable = <DTO, ReadOpts extends ReadResolverOpts<DTO>, QS extends QueryService<DTO, unknown, unknown>>(
  DTOClass: Class<DTO>,
  opts: ReadOpts,
) => <B extends Class<ServiceResolver<DTO, QS>>>(BaseClass: B): Class<ReadResolverFromOpts<DTO, ReadOpts, QS>> & B => {
  const { baseNameLower, pluralBaseNameLower, baseName } = getDTONames(DTOClass, opts);
  const readOneQueryName = opts.one?.name ?? baseNameLower;
  const readManyQueryName = opts.many?.name ?? pluralBaseNameLower;
  const { QueryArgs = QueryArgsType(DTOClass, opts) } = opts;
  const {
    Connection = ConnectionType(
      DTOClass,
      extractConnectionOptsFromQueryArgs(QueryArgs, { ...opts, connectionName: `${baseName}Connection` }),
    ),
  } = opts;

  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'QueryArgs', 'Connection');
  @ArgsType()
  class QA extends QueryArgs {}

  @ArgsType()
  class FO extends FindOneArgsType() {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ReadResolverBase extends BaseClass {
    @ResolverQuery(
      () => DTOClass,
      { nullable: true, name: readOneQueryName },
      commonResolverOpts,
      { interceptors: [HookInterceptor(HookTypes.BEFORE_FIND_ONE, DTOClass)] },
      opts.one ?? {},
    )
    async findById(@HookArgs() input: FO, @Context() context?: unknown): Promise<DTO | undefined> {
      const authorizeFilter = await getAuthFilter(this.authorizer, context);
      return this.service.findById(input.id, { filter: authorizeFilter });
    }

    @ResolverQuery(
      () => Connection.resolveType,
      { name: readManyQueryName },
      commonResolverOpts,
      { interceptors: [HookInterceptor(HookTypes.BEFORE_QUERY_MANY, DTOClass)] },
      opts.many ?? {},
    )
    async queryMany(@HookArgs() query: QA, @Context() context?: unknown): Promise<ConnectionType<DTO>> {
      const authorizeFilter = await getAuthFilter(this.authorizer, context);
      const qa = mergeQuery(query, { filter: authorizeFilter });
      return Connection.createFromPromise(
        (q) => this.service.query(q),
        qa,
        (filter) => this.service.count(filter),
      );
    }
  }
  return ReadResolverBase as Class<ReadResolverFromOpts<DTO, ReadOpts, QS>> & B;
};
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const ReadResolver = <
  DTO,
  ReadOpts extends ReadResolverOpts<DTO> = CursorQueryArgsTypeOpts<DTO>,
  QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>
>(
  DTOClass: Class<DTO>,
  opts: ReadOpts = {} as ReadOpts,
): ResolverClass<DTO, QS, ReadResolverFromOpts<DTO, ReadOpts, QS>> => Readable(DTOClass, opts)(BaseServiceResolver);
