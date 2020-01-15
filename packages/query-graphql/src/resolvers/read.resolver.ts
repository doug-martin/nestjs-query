import { Class, DeepPartial } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { ArgsType, ID } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import { BaseServiceResolver, ResolverOptions, ServiceResolver } from './resolver.interface';
import { ConnectionType, QueryArgsType, StaticConnectionType, StaticQueryType } from '../types';
import { ResolverQuery } from '../decorators';
import { DTONamesOpts, getDTONames, transformAndValidate } from './helpers';

export type ReadResolverArgs<DTO> = DTONamesOpts &
  ResolverOptions & {
    QueryArgs?: StaticQueryType<DTO>;
    Connection?: StaticConnectionType<DTO>;
  };

export interface ReadResolver<DTO> {
  queryMany(query: QueryArgsType<DTO>): Promise<ConnectionType<DTO>>;
  queryOne(id: string | number): Promise<DTO | undefined>;
}

export const Readable = <DTO>(DTOClass: Class<DTO>, args: ReadResolverArgs<DTO> = {}) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<ReadResolver<DTO>> & B => {
  const { QueryArgs = QueryArgsType(DTOClass), Connection = ConnectionType(DTOClass) } = args;
  const { baseNameLower, pluralBaseNameLower } = getDTONames(args, DTOClass);

  const commonResolverOptions = omit(args, 'dtoName', 'one', 'many', 'QueryArgs', 'Connection');

  @ArgsType()
  class QA extends QueryArgs {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ResolverBase extends BaseClass {
    @ResolverQuery(() => DTOClass, { nullable: true, name: baseNameLower }, commonResolverOptions, args.one ?? {})
    async queryOne(@Args({ name: 'id', type: () => ID }) id: string | number): Promise<DTO | undefined> {
      return this.service.findById(id);
    }

    @ResolverQuery(() => Connection, { name: pluralBaseNameLower }, commonResolverOptions, args.many ?? {})
    async queryMany(@Args() query: QA): Promise<ConnectionType<DTO>> {
      const qa = await transformAndValidate(QA, query as DeepPartial<QA>);
      return Connection.createFromPromise(this.service.query(qa), qa.paging || {});
    }
  }

  return ResolverBase;
};

type ReadResolverType<DTO> = Class<ReadResolver<DTO>> & Class<BaseServiceResolver<DTO>>;

export const ReadResolver = <DTO>(DTOClass: Class<DTO>, args: ReadResolverArgs<DTO> = {}): ReadResolverType<DTO> =>
  Readable(DTOClass, args)(BaseServiceResolver);
