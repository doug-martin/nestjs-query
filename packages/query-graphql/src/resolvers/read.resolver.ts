import { Class, DeepPartial } from '@nestjs-query/core';
import { ArgsType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import { BaseServiceResolver, ServiceResolver } from './resolver.interface';
import { ConnectionType, QueryArgsType, StaticConnectionType, StaticQueryType } from '../types';
import { ResolverMethodOptions, ResolverQuery } from '../decorators';
import { getDTONames, transformAndValidate } from './helpers';

export type ReadResolverArgs<DTO> = {
  dtoName?: string;
  QueryArgs?: StaticQueryType<DTO>;
  Connection?: StaticConnectionType<DTO>;
  query?: ResolverMethodOptions;
  queryOne?: ResolverMethodOptions;
};

export interface ReadResolver<DTO> {
  query(query: QueryArgsType<DTO>): Promise<ConnectionType<DTO>>;
  queryOne(query: QueryArgsType<DTO>): Promise<DTO | undefined>;
}

export const Readable = <DTO>(DTOClass: Class<DTO>, args: ReadResolverArgs<DTO> = {}) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<ReadResolver<DTO>> & B => {
  const { QueryArgs = QueryArgsType(DTOClass), Connection = ConnectionType(DTOClass) } = args;
  const { baseNameLower, pluralBaseNameLower } = getDTONames(args, DTOClass);
  @ArgsType()
  class QA extends QueryArgs {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ResolverBase extends BaseClass {
    @ResolverQuery(() => Connection, { name: pluralBaseNameLower }, args.query ?? {})
    async query(@Args() query: QA): Promise<ConnectionType<DTO>> {
      const qa = await transformAndValidate(QA, query as DeepPartial<QA>);
      return Connection.createFromPromise(this.service.query(qa), qa.paging || {});
    }

    @ResolverQuery(() => DTOClass, { nullable: true, name: baseNameLower }, args.queryOne ?? {})
    async queryOne(@Args() query: QA): Promise<DTO | undefined> {
      const qa = await transformAndValidate(QA, query as DeepPartial<QA>);
      return this.service.queryOne(qa);
    }
  }

  return ResolverBase;
};

type ReadResolverType<DTO> = Class<ReadResolver<DTO>> & Class<BaseServiceResolver<DTO>>;

export const ReadResolver = <DTO>(DTOClass: Class<DTO>, args: ReadResolverArgs<DTO> = {}): ReadResolverType<DTO> =>
  Readable(DTOClass, args)(BaseServiceResolver);
