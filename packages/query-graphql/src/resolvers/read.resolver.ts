import { Class, mergeQuery, MetaValue, QueryService } from '@nestjs-query/core';
import { ArgsType, Resolver, Context } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { getDTONames } from '../common';
import { getQueryManyHook, HookArgs, ResolverQuery, HookFunc, getFindOneHook } from '../decorators';
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
import { getAuthFilter, transformAndValidate } from './helpers';

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
  Pick<CursorConnectionOptions, 'enableTotalCount'>;

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
  const { QueryArgs = QueryArgsType(DTOClass, opts) } = opts;
  const {
    Connection = ConnectionType(DTOClass, QueryArgs, { ...opts, connectionName: `${baseName}Connection` }),
  } = opts;

  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'QueryArgs', 'Connection');
  @ArgsType()
  class QA extends QueryArgs {}

  @ArgsType()
  class FO extends FindOneArgsType() {}

  const queryManyHook = getQueryManyHook(DTOClass) as MetaValue<HookFunc<QA>>;
  const findOneHook = getFindOneHook(DTOClass) as MetaValue<HookFunc<QA>>;

  @Resolver(() => DTOClass, { isAbstract: true })
  class ReadResolverBase extends BaseClass {
    @ResolverQuery(() => DTOClass, { nullable: true, name: baseNameLower }, commonResolverOpts, opts.one ?? {})
    async findById(@HookArgs(FO, findOneHook) input: FO, @Context() context?: unknown): Promise<DTO | undefined> {
      const authorizeFilter = await getAuthFilter(this.authorizer, context);
      return this.service.findById(input.id, { filter: authorizeFilter });
    }

    @ResolverQuery(() => Connection.resolveType, { name: pluralBaseNameLower }, commonResolverOpts, opts.many ?? {})
    async queryMany(
      @HookArgs(QA, queryManyHook) query: QA,
      @Context() context?: unknown,
    ): Promise<ConnectionType<DTO>> {
      const authorizeFilter = await getAuthFilter(this.authorizer, context);
      const qa = await transformAndValidate(QA, mergeQuery(query, { filter: authorizeFilter }));
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
