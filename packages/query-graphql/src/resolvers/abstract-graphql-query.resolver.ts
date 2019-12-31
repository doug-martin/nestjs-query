import pick from 'lodash.pick';
import {
  AbstractQueryService,
  Class,
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
import { Resolver, Args } from '@nestjs/graphql';
import { lowerCaseFirst } from 'change-case';
import { plural } from 'pluralize';
import {
  createResolverTypesFactory,
  deleteResolverTypesFactory,
  readResolverTypesFactory,
  updateResolverTypesFactory,
} from './type-factories';
import { GraphQLResolver, StaticGraphQLResolver } from './graphql-query-resolver.interface';
import { UpdateManyResponseType, DeleteManyResponseType, ConnectionType, QueryType } from '../types';
import { ResolverMutation, ResolverQuery, ResolverMethodOptions } from '../decorators';

type DisableMethodOptions = { disabled?: boolean };
export type QueryMethodOptions = ResolverMethodOptions & DisableMethodOptions;

export type MethodOptions = {
  queries?: QueryMethodOptions;
  query?: QueryMethodOptions;
  mutations?: QueryMethodOptions;
  createOne?: QueryMethodOptions;
  createMany?: QueryMethodOptions;
  updateOne?: QueryMethodOptions;
  updateMany?: QueryMethodOptions;
  deleteOne?: QueryMethodOptions;
  deleteMany?: QueryMethodOptions;
};

export interface GraphQLQueryResolverOpts<
  DTO,
  C extends DeepPartial<DTO>,
  U extends DeepPartial<DTO>,
  D extends DeepPartial<DTO>
> {
  typeName?: string;
  CreateType?(): Class<C>;
  UpdateType?(): Class<U>;
  DeleteType?(): Class<D>;
  methods?: MethodOptions;
}

export function GraphQLQueryResolver<
  DTO,
  C extends DeepPartial<DTO>,
  U extends DeepPartial<DTO>,
  D extends DeepPartial<DTO>
>(DTOClass: Class<DTO>, opts: GraphQLQueryResolverOpts<DTO, C, U, D> = {}): StaticGraphQLResolver<DTO, C, U, D> {
  const baseName = opts.typeName ?? DTOClass.name;

  const { CreateManyInputType, CreateOneInputType } = createResolverTypesFactory(
    DTOClass,
    pick(opts, 'typeName', 'CreateType'),
  );
  const { QueryType: QT, ConnectionType: CT } = readResolverTypesFactory(DTOClass, pick(opts, 'typeName'));
  const { UpdateManyInputType, UpdateOneInputType } = updateResolverTypesFactory(DTOClass, {
    ...pick(opts, 'typeName', 'UpdateType'),
    FilterType: QT.FilterType,
  });
  const { DeleteType, DeleteManyInputType, DeleteOneInputType } = deleteResolverTypesFactory(DTOClass, {
    ...pick(opts, 'typeName', 'DeleteType'),
    FilterType: QT.FilterType,
  });

  const UMR = UpdateManyResponseType();
  const DMR = DeleteManyResponseType();

  const pluralizedBaseName = plural(baseName);
  const baseNameLower = lowerCaseFirst(baseName);
  const pluralizeBaseNameLower = plural(baseNameLower);

  @Resolver(() => DTOClass, { isAbstract: true })
  class AbstractResolver implements GraphQLResolver<DTO, C, U, D> {
    static QueryType = QT;

    static ConnectionType = CT;

    static CreateOneInputType = CreateOneInputType;

    static CreateManyInputType = CreateManyInputType;

    static UpdateOneInputType = UpdateOneInputType;

    static UpdateManyInputType = UpdateManyInputType;

    static DeleteOneInputType = DeleteOneInputType;

    static DeleteManyInputType = DeleteManyInputType;

    constructor(private readonly service: AbstractQueryService<DTO>) {}

    @ResolverQuery(
      () => CT,
      { name: `${pluralizeBaseNameLower}` },
      opts.methods?.queries || {},
      opts.methods?.query || {},
    )
    async query(@Args({ type: () => QT }) query: QueryType<DTO>): Promise<ConnectionType<DTO>> {
      return CT.create(this.service.query(query), query.paging);
    }

    @ResolverMutation(
      () => DTOClass,
      { name: `createOne${baseName}` },
      opts.methods?.mutations || {},
      opts.methods?.createOne || {},
    )
    createOne(@Args({ name: 'input', type: () => CreateOneInputType }) input: CreateOne<DTO, C>): Promise<DTO> {
      return this.service.createOne(input);
    }

    @ResolverMutation(
      () => [DTOClass],
      { name: `createMany${pluralizedBaseName}` },
      opts.methods?.mutations || {},
      opts.methods?.createMany || {},
    )
    createMany(@Args({ name: 'input', type: () => CreateManyInputType }) input: CreateMany<DTO, C>): Promise<DTO[]> {
      return this.service.createMany(input);
    }

    @ResolverMutation(
      () => DTOClass,
      { name: `updateOne${baseName}` },
      opts.methods?.mutations || {},
      opts.methods?.updateOne || {},
    )
    updateOne(@Args({ name: 'input', type: () => UpdateOneInputType }) input: UpdateOne<DTO, U>): Promise<DTO> {
      return this.service.updateOne(input);
    }

    @ResolverMutation(
      () => UMR,
      { name: `updateMany${pluralizedBaseName}` },
      opts.methods?.mutations || {},
      opts.methods?.updateMany || {},
    )
    updateMany(
      @Args({ name: 'input', type: () => UpdateManyInputType }) input: UpdateMany<DTO, U>,
    ): Promise<UpdateManyResponse> {
      return this.service.updateMany(input);
    }

    @ResolverMutation(
      () => DeleteType,
      { name: `deleteOne${baseName}` },
      opts.methods?.mutations || {},
      opts.methods?.deleteOne || {},
    )
    deleteOne(@Args({ name: 'input', type: () => DeleteOneInputType }) input: DeleteOne): Promise<Partial<DTO>> {
      return this.service.deleteOne(input);
    }

    @ResolverMutation(
      () => DMR,
      { name: `deleteMany${pluralizedBaseName}` },
      opts.methods?.mutations || {},
      opts.methods?.deleteMany || {},
    )
    deleteMany(
      @Args({ name: 'input', type: () => DeleteManyInputType }) input: DeleteMany<DTO>,
    ): Promise<DeleteManyResponse> {
      return this.service.deleteMany(input);
    }
  }

  return AbstractResolver;
}
