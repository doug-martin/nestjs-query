import { Class } from '@nestjs-query/core';
import { Args, ArgsType, ID, Resolver } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { getDTONames } from '../common';
import { ResolverQuery } from '../decorators';
import { ConnectionType, QueryArgsType, QueryArgsTypeOpts, StaticConnectionType, StaticQueryArgsType } from '../types';
import { CursorConnectionOptions } from '../types/connection/cursor';
import { CursorQueryArgsTypeOpts } from '../types/query/query-args';
import { transformAndValidate } from './helpers';
import {
  BaseServiceResolver,
  ConnectionTypeFromOpts,
  QueryArgsFromOpts,
  ResolverClass,
  ResolverOpts,
  ServiceResolver,
} from './resolver.interface';

export type ReadResolverFromOpts<DTO, Opts extends ReadResolverOpts<DTO>> = ReadResolver<
  DTO,
  QueryArgsFromOpts<DTO, Opts>,
  ConnectionTypeFromOpts<DTO, Opts>
>;

export type ReadResolverOpts<DTO> = {
  QueryArgs?: StaticQueryArgsType<DTO>;
  Connection?: StaticConnectionType<DTO>;
} & ResolverOpts &
  QueryArgsTypeOpts<DTO> &
  Pick<CursorConnectionOptions, 'enableTotalCount'>;

export interface ReadResolver<DTO, QT extends QueryArgsType<DTO>, CT extends ConnectionType<DTO>>
  extends ServiceResolver<DTO> {
  queryMany(query: QT): Promise<CT>;
  findById(id: string | number): Promise<DTO | undefined>;
}

/**
 * @internal
 * Mixin to add `read` graphql endpoints.
 */
export const Readable = <DTO, ReadOpts extends ReadResolverOpts<DTO>>(DTOClass: Class<DTO>, opts: ReadOpts) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<ReadResolverFromOpts<DTO, ReadOpts>> & B => {
  const { baseNameLower, pluralBaseNameLower, baseName } = getDTONames(DTOClass, opts);
  const { QueryArgs = QueryArgsType(DTOClass, opts) } = opts;
  const {
    Connection = ConnectionType(DTOClass, QueryArgs, { ...opts, connectionName: `${baseName}Connection` }),
  } = opts;

  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'QueryArgs', 'Connection');
  @ArgsType()
  class QA extends QueryArgs {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ReadResolverBase extends BaseClass {
    @ResolverQuery(() => DTOClass, { nullable: true, name: baseNameLower }, commonResolverOpts, opts.one ?? {})
    async findById(@Args({ name: 'id', type: () => ID }) id: string | number): Promise<DTO | undefined> {
      return this.service.findById(id);
    }

    @ResolverQuery(() => Connection.resolveType, { name: pluralBaseNameLower }, commonResolverOpts, opts.many ?? {})
    async queryMany(@Args() query: QA): Promise<ConnectionType<DTO>> {
      const qa = await transformAndValidate(QA, query);
      return Connection.createFromPromise(
        (q) => this.service.query(q),
        qa,
        (filter) => this.service.count(filter),
      );
    }
  }
  return ReadResolverBase as Class<ReadResolverFromOpts<DTO, ReadOpts>> & B;
};

export const ReadResolver = <DTO, ReadOpts extends ReadResolverOpts<DTO> = CursorQueryArgsTypeOpts<DTO>>(
  DTOClass: Class<DTO>,
  opts: ReadOpts = {} as ReadOpts,
): ResolverClass<DTO, ReadResolverFromOpts<DTO, ReadOpts>> => Readable(DTOClass, opts)(BaseServiceResolver);
