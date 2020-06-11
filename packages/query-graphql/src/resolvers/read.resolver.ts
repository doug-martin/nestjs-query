import { Class } from '@nestjs-query/core';
import { Args, ArgsType, ID, Resolver } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { getDTONames } from '../common';
import { ResolverQuery } from '../decorators';
import {
  ConnectionType,
  CursorQueryArgsType,
  LimitOffsetQueryArgsType,
  PagingStrategies,
  QueryArgsType,
  QueryArgsTypeOpts,
  StaticConnectionType,
  StaticPagingTypes,
  StaticQueryArgsType,
} from '../types';
import { createAllQueryArgsType, transformAndValidate } from './helpers';
import { BaseServiceResolver, ResolverClass, ResolverOpts, ServiceResolver } from './resolver.interface';

export interface ReadResolverOpts<DTO> extends ResolverOpts, QueryArgsTypeOpts<DTO> {
  QueryArgs?: StaticQueryArgsType<DTO, StaticPagingTypes>;
  Connection?: StaticConnectionType<DTO>;
}

export interface ReadResolver<DTO> extends ServiceResolver<DTO> {
  queryMany(query: LimitOffsetQueryArgsType<DTO>): Promise<DTO[]>;
  queryManyConnection(query: CursorQueryArgsType<DTO>): Promise<ConnectionType<DTO>>;
  findById(id: string | number): Promise<DTO | undefined>;
}

/**
 * @internal
 * Mixin to add `read` graphql endpoints.
 */
export const Readable = <DTO>(DTOClass: Class<DTO>, opts: ReadResolverOpts<DTO>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<ReadResolver<DTO>> & B => {
  const { QueryArgs = QueryArgsType(DTOClass, opts), Connection = ConnectionType(DTOClass) } = opts;
  const { baseNameLower, pluralBaseNameLower } = getDTONames(DTOClass, opts);

  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'QueryArgs', 'Connection');
  const { CursorQueryType, LimitOffsetQueryType } = createAllQueryArgsType(DTOClass, opts, QueryArgs);
  @ArgsType()
  class CursorQueryArgs extends CursorQueryType {}

  @ArgsType()
  class LimitOffsetQueryArgs extends LimitOffsetQueryType {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ReadResolverBase extends BaseClass {
    @ResolverQuery(() => DTOClass, { nullable: true, name: baseNameLower }, commonResolverOpts, opts.one ?? {})
    async findById(@Args({ name: 'id', type: () => ID }) id: string | number): Promise<DTO | undefined> {
      return this.service.findById(id);
    }

    @ResolverQuery(
      () => Connection,
      { name: pluralBaseNameLower },
      { disabled: QueryArgs.PageType.strategy !== PagingStrategies.CURSOR },
      commonResolverOpts,
      opts.many ?? {},
    )
    async queryManyConnection(@Args() query: CursorQueryArgs): Promise<ConnectionType<DTO>> {
      const qa = await transformAndValidate(CursorQueryArgs, query);
      return Connection.createFromPromise((q) => this.service.query(q), qa);
    }

    @ResolverQuery(
      () => [DTOClass],
      { name: pluralBaseNameLower },
      { disabled: QueryArgs.PageType.strategy !== PagingStrategies.LIMIT_OFFSET },
      commonResolverOpts,
      opts.many ?? {},
    )
    async queryMany(@Args() query: LimitOffsetQueryArgs): Promise<DTO[]> {
      const qa = await transformAndValidate(LimitOffsetQueryArgs, query);
      return this.service.query(qa);
    }
  }
  return ReadResolverBase;
};

export const ReadResolver = <DTO>(
  DTOClass: Class<DTO>,
  opts: ReadResolverOpts<DTO> = {},
): ResolverClass<DTO, ReadResolver<DTO>> => Readable(DTOClass, opts)(BaseServiceResolver);
