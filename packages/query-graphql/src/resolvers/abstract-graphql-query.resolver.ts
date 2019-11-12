/* eslint-disable max-classes-per-file */
import {
  AbstractQueryService,
  CreateMany,
  CreateOne,
  DeepPartial,
  DeleteMany,
  DeleteManyResponse,
  DeleteOne,
  UpdateMany,
  UpdateManyResponse,
  UpdateOne,
} from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { lowerCaseFirst } from 'change-case';
import { plural } from 'pluralize';
import {
  createResolverTypesFactory,
  deleteResolverTypesFactory,
  readResolverTypesFactory,
  updateResolverTypesFactory,
} from './type-factories';
import { GraphQLResolver, StaticGraphQLResolver } from './graphql-query-resolver.interface';
import { UpdateManyResponseType, DeleteManyResponseType, GraphQLConnectionType, GraphQLQueryType } from '../types';

export type GraphQLQueryResolverOpts<
  DTO,
  C extends DeepPartial<DTO>,
  U extends DeepPartial<DTO>,
  D extends DeepPartial<DTO>
> = {
  name?: string;
  CreateType?: () => Type<C>;
  UpdateType?: () => Type<U>;
  DeleteType?: () => Type<D>;
};

export function GraphQLQueryResolver<
  DTO,
  C extends DeepPartial<DTO>,
  U extends DeepPartial<DTO>,
  D extends DeepPartial<DTO>
>(
  DTOClass: Type<DTO>,
  opts: GraphQLQueryResolverOpts<DTO, C, U, D> = {},
): Type<GraphQLResolver<DTO, C, U, D>> & StaticGraphQLResolver<DTO, C, U, D> {
  const baseName = opts.name ? opts.name : DTOClass.name;

  const { CreateManyInputType, CreateOneInputType } = createResolverTypesFactory(DTOClass, opts);
  const { QueryType, ConnectionType } = readResolverTypesFactory(DTOClass, opts);
  const { UpdateManyInputType, UpdateOneInputType } = updateResolverTypesFactory(DTOClass, {
    ...opts,
    FilterType: QueryType.FilterType,
  });
  const { DeleteType, DeleteManyInputType, DeleteOneInputType } = deleteResolverTypesFactory(DTOClass, {
    ...opts,
    FilterType: QueryType.FilterType,
  });

  const pluralizedBaseName = plural(baseName);
  const baseNameLower = lowerCaseFirst(baseName);
  const pluralizeBaseNameLower = plural(baseNameLower);

  @Resolver(() => DTOClass, { isAbstract: true })
  class AbstractResolver implements GraphQLResolver<DTO, C, U, D> {
    static QueryType = QueryType;

    static ConnectionType = ConnectionType;

    static CreateOneInputType = CreateOneInputType;

    static CreateManyInputType = CreateManyInputType;

    static UpdateOneInputType = UpdateOneInputType;

    static UpdateManyInputType = UpdateManyInputType;

    static DeleteOneInputType = DeleteOneInputType;

    static DeleteManyInputType = DeleteManyInputType;

    constructor(private readonly service: AbstractQueryService<DTO>) {}

    @Query(() => ConnectionType, { name: `${pluralizeBaseNameLower}` })
    async query(@Args({ type: () => QueryType }) query: GraphQLQueryType<DTO>): Promise<GraphQLConnectionType<DTO>> {
      return ConnectionType.create(query.paging, await this.service.query(query));
    }

    @Mutation(() => [DTOClass], { name: `createMany${pluralizedBaseName}` })
    createMany(@Args({ name: 'input', type: () => CreateManyInputType }) input: CreateMany<DTO, C>): Promise<DTO[]> {
      return this.service.createMany(input);
    }

    @Mutation(() => DTOClass, { name: `createOne${baseName}` })
    createOne(@Args({ name: 'input', type: () => CreateOneInputType }) input: CreateOne<DTO, C>): Promise<DTO> {
      return this.service.createOne(input);
    }

    @Mutation(() => DeleteManyResponseType, { name: `deleteMany${pluralizedBaseName}` })
    deleteMany(
      @Args({ name: 'input', type: () => DeleteManyInputType }) input: DeleteMany<DTO>,
    ): Promise<DeleteManyResponse> {
      return this.service.deleteMany(input);
    }

    @Mutation(() => DeleteType, { name: `deleteOne${baseName}` })
    deleteOne(@Args({ name: 'input', type: () => DeleteOneInputType }) input: DeleteOne): Promise<Partial<DTO>> {
      return this.service.deleteOne(input);
    }

    @Mutation(() => UpdateManyResponseType, { name: `updateMany${pluralizedBaseName}` })
    updateMany(
      @Args({ name: 'input', type: () => UpdateManyInputType }) input: UpdateMany<DTO, U>,
    ): Promise<UpdateManyResponse> {
      return this.service.updateMany(input);
    }

    @Mutation(() => DTOClass, { name: `updateOne${baseName}` })
    updateOne(@Args({ name: 'input', type: () => UpdateOneInputType }) input: UpdateOne<DTO, U>): Promise<DTO> {
      return this.service.updateOne(input);
    }
  }

  return AbstractResolver;
}
