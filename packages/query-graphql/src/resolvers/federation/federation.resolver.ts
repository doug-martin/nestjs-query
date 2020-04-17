import { Class } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { ArgsType, ID, Resolver, Args } from '@nestjs/graphql';
import { getDTONames } from '../common';
import { RelationsOpts } from '../resolver.interface';
import { BaseServiceResolver, ResolverClass, ResolverOpts, ServiceResolver } from './resolver.interface';
import { ConnectionType, QueryArgsType, StaticConnectionType, StaticQueryType } from '../types';
import { ResolverQuery } from '../decorators';
import { transformAndValidate } from './helpers';
import { FederatedRelationsOpts } from './interfaces';

export interface FederationResolverOpts<DTO> extends ResolverOpts, RelationsOpts {
  QueryArgs?: StaticQueryType<DTO>;
  Connection?: StaticConnectionType<DTO>;
}

export interface ReadResolver<DTO> extends ServiceResolver<DTO> {
  queryMany(query: QueryArgsType<DTO>): Promise<ConnectionType<DTO>>;
  findById(id: string | number): Promise<DTO | undefined>;
}

/**
 * @internal
 * Mixin to add `read` graphql endpoints.
 */
export const Federated = <DTO>(DTOClass: Class<DTO>, opts: FederatedRelationsOpts) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<ReadResolver<DTO>> & B => {
  const { QueryArgs = QueryArgsType(DTOClass, opts), Connection = ConnectionType(DTOClass) } = opts;
  const { baseNameLower, pluralBaseNameLower } = getDTONames(DTOClass, opts);

  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'QueryArgs', 'Connection');

  @ArgsType()
  class QA extends QueryArgs {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ReadResolverBase extends BaseClass {
    @ResolverQuery(() => DTOClass, { nullable: true, name: baseNameLower }, commonResolverOpts, opts.one ?? {})
    async findById(@Args({ name: 'id', type: () => ID }) id: string | number): Promise<DTO | undefined> {
      return this.service.findById(id);
    }

    @ResolverQuery(() => Connection, { name: pluralBaseNameLower }, commonResolverOpts, opts.many ?? {})
    async queryMany(@Args() query: QA): Promise<ConnectionType<DTO>> {
      const qa = await transformAndValidate(QA, query);
      return Connection.createFromPromise(this.service.query(qa), qa.paging || {});
    }
  }
  return ReadResolverBase;
};

export const FederationResolver = <DTO>(
  DTOClass: Class<DTO>,
  opts: FederatedRelationsOpts<DTO> = {},
): ResolverClass<DTO, ReadResolver<DTO>> => Federated(DTOClass, opts)(BaseServiceResolver);
