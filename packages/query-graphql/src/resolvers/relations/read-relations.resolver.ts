import { Class, Filter, mergeQuery, QueryService } from '@nestjs-query/core';
import { ExecutionContext } from '@nestjs/common';
import { Args, ArgsType, Context, Parent, Resolver } from '@nestjs/graphql';
import { OperationGroup } from '../../auth';
import { getDTONames } from '../../common';
import { RelationAuthorizerFilter, ResolverField } from '../../decorators';
import { AuthorizerInterceptor } from '../../interceptors';
import { CountRelationsLoader, DataLoaderFactory, FindRelationsLoader, QueryRelationsLoader } from '../../loader';
import { QueryArgsType } from '../../types';
import { transformAndValidate } from '../helpers';
import { BaseServiceResolver, ServiceResolver } from '../resolver.interface';
import { flattenRelations, removeRelationOpts } from './helpers';
import { RelationsOpts, ResolverRelation } from './relations.interface';

export interface ReadRelationsResolverOpts extends RelationsOpts {
  enableTotalCount?: boolean;
}

const ReadOneRelationMixin =
  <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    if (relation.disableRead) {
      return Base;
    }
    const commonResolverOpts = removeRelationOpts(relation);
    const relationDTO = relation.DTO;
    const { baseNameLower, baseName } = getDTONames(relationDTO, { dtoName: relation.dtoName });
    const relationName = relation.relationName ?? baseNameLower;
    const loaderName = `load${baseName}For${DTOClass.name}`;
    const findLoader = new FindRelationsLoader<DTO, Relation>(relationDTO, relationName);

    @Resolver(() => DTOClass, { isAbstract: true })
    class ReadOneMixin extends Base {
      @ResolverField(
        baseNameLower,
        () => relationDTO,
        { nullable: relation.nullable, complexity: relation.complexity },
        commonResolverOpts,
        { interceptors: [AuthorizerInterceptor(DTOClass)] },
      )
      async [`find${baseName}`](
        @Parent() dto: DTO,
        @Context() context: ExecutionContext,
        @RelationAuthorizerFilter(baseNameLower, {
          operationGroup: OperationGroup.READ,
          many: false,
        })
        authFilter?: Filter<Relation>,
      ): Promise<Relation | undefined> {
        return DataLoaderFactory.getOrCreateLoader(context, loaderName, findLoader.createLoader(this.service)).load({
          dto,
          filter: authFilter,
        });
      }
    }
    return ReadOneMixin;
  };

const ReadManyRelationMixin =
  <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    if (relation.disableRead) {
      return Base;
    }
    const commonResolverOpts = removeRelationOpts(relation);
    const relationDTO = relation.DTO;
    const dtoName = getDTONames(DTOClass).baseName;
    const { pluralBaseNameLower, pluralBaseName } = getDTONames(relationDTO, { dtoName: relation.dtoName });
    const relationName = relation.relationName ?? pluralBaseNameLower;
    const relationLoaderName = `load${pluralBaseName}For${DTOClass.name}`;
    const countRelationLoaderName = `count${pluralBaseName}For${DTOClass.name}`;
    const queryLoader = new QueryRelationsLoader<DTO, Relation>(relationDTO, relationName);
    const countLoader = new CountRelationsLoader<DTO, Relation>(relationDTO, relationName);
    const connectionName = `${dtoName}${pluralBaseName}Connection`;
    @ArgsType()
    class RelationQA extends QueryArgsType(relationDTO, {
      ...relation,
      connectionName,
      disableKeySetPagination: true,
    }) {}

    // disable keyset pagination for relations otherwise recursive paging will not work
    const { ConnectionType: CT } = RelationQA;
    @Resolver(() => DTOClass, { isAbstract: true })
    class ReadManyMixin extends Base {
      @ResolverField(
        pluralBaseNameLower,
        () => CT.resolveType,
        { nullable: relation.nullable, complexity: relation.complexity },
        commonResolverOpts,
        { interceptors: [AuthorizerInterceptor(DTOClass)] },
      )
      async [`query${pluralBaseName}`](
        @Parent() dto: DTO,
        @Args() q: RelationQA,
        @Context() context: ExecutionContext,
        @RelationAuthorizerFilter(pluralBaseNameLower, {
          operationGroup: OperationGroup.READ,
          many: true,
        })
        relationFilter?: Filter<Relation>,
      ): Promise<InstanceType<typeof CT>> {
        const qa = await transformAndValidate(RelationQA, q);
        const relationLoader = DataLoaderFactory.getOrCreateLoader(
          context,
          relationLoaderName,
          queryLoader.createLoader(this.service),
        );
        const relationCountLoader = DataLoaderFactory.getOrCreateLoader(
          context,
          countRelationLoaderName,
          countLoader.createLoader(this.service),
        );
        return CT.createFromPromise(
          (query) => relationLoader.load({ dto, query }),
          mergeQuery(qa, { filter: relationFilter }),
          (filter) => relationCountLoader.load({ dto, filter }),
        );
      }
    }
    return ReadManyMixin;
  };

export const ReadRelationsMixin =
  <DTO>(DTOClass: Class<DTO>, relations: ReadRelationsResolverOpts) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    const { many, one, enableTotalCount } = relations;
    const manyRelations = flattenRelations(many ?? {});
    const oneRelations = flattenRelations(one ?? {});
    const WithMany = manyRelations.reduce(
      (RB, a) => ReadManyRelationMixin(DTOClass, { enableTotalCount, ...a })(RB),
      Base,
    );
    return oneRelations.reduce((RB, a) => ReadOneRelationMixin(DTOClass, a)(RB), WithMany);
  };

export const ReadRelationsResolver = <
  DTO,
  QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>,
>(
  DTOClass: Class<DTO>,
  relations: ReadRelationsResolverOpts,
): Class<ServiceResolver<DTO, QS>> => ReadRelationsMixin(DTOClass, relations)(BaseServiceResolver);
