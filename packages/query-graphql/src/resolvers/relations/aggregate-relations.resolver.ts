import { AggregateQuery, AggregateResponse, Class, mergeFilter, QueryService } from '@nestjs-query/core';
import { ExecutionContext } from '@nestjs/common';
import { Args, ArgsType, Context, Parent, Resolver } from '@nestjs/graphql';
import { getDTONames } from '../../common';
import { AggregateQueryParam, ResolverField } from '../../decorators';
import { AggregateRelationsLoader, DataLoaderFactory } from '../../loader';
import { AggregateArgsType, AggregateResponseType } from '../../types';
import { getRelationAuthFilter, transformAndValidate } from '../helpers';
import { BaseServiceResolver, ServiceResolver } from '../resolver.interface';
import { flattenRelations, removeRelationOpts } from './helpers';
import { RelationsOpts, ResolverRelation } from './relations.interface';

export interface AggregateRelationsResolverOpts extends RelationsOpts {
  /**
   * Enable relation aggregation queries on relation
   */
  enableAggregate?: boolean;
}

type AggregateRelationOpts<Relation> = {
  enableAggregate?: boolean;
} & ResolverRelation<Relation>;

const AggregateRelationMixin = <DTO, Relation>(DTOClass: Class<DTO>, relation: AggregateRelationOpts<Relation>) => <
  B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>
>(
  Base: B,
): B => {
  if (!relation.enableAggregate) {
    return Base;
  }
  const commonResolverOpts = removeRelationOpts(relation);
  const relationDTO = relation.DTO;
  const dtoName = getDTONames(DTOClass).baseName;
  const { baseNameLower, pluralBaseNameLower, pluralBaseName } = getDTONames(relationDTO, {
    dtoName: relation.dtoName,
  });
  const relationName = relation.relationName ?? pluralBaseNameLower;
  const aggregateRelationLoaderName = `aggregate${pluralBaseName}For${dtoName}`;
  const aggregateLoader = new AggregateRelationsLoader<DTO, Relation>(relationDTO, relationName);
  @ArgsType()
  class RelationQA extends AggregateArgsType(relationDTO) {}

  const AR = AggregateResponseType(relationDTO, { prefix: `${dtoName}${pluralBaseName}` });
  @Resolver(() => DTOClass, { isAbstract: true })
  class AggregateMixin extends Base {
    @ResolverField(`${pluralBaseNameLower}Aggregate`, () => AR, {}, commonResolverOpts)
    async [`aggregate${pluralBaseName}`](
      @Parent() dto: DTO,
      @Args() q: RelationQA,
      @AggregateQueryParam() aggregateQuery: AggregateQuery<Relation>,
      @Context() context: ExecutionContext,
    ): Promise<AggregateResponse<Relation>> {
      const qa = await transformAndValidate(RelationQA, q);
      const loader = DataLoaderFactory.getOrCreateLoader(
        context,
        aggregateRelationLoaderName,
        aggregateLoader.createLoader(this.service),
      );
      const relationFilter = await getRelationAuthFilter<DTO, Relation>(baseNameLower, this.authorizer, context);
      return loader.load({
        dto,
        filter: mergeFilter(qa.filter ?? {}, relationFilter ?? {}),
        aggregate: aggregateQuery,
      });
    }
  }
  return AggregateMixin;
};

export const AggregateRelationsMixin = <DTO>(DTOClass: Class<DTO>, relations: AggregateRelationsResolverOpts) => <
  B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>
>(
  Base: B,
): B => {
  const { many, enableAggregate } = relations;
  const manyRelations = flattenRelations(many ?? {});
  return manyRelations.reduce((RB, a) => AggregateRelationMixin(DTOClass, { enableAggregate, ...a })(RB), Base);
};

export const AggregateRelationsResolver = <DTO>(
  DTOClass: Class<DTO>,
  relations: AggregateRelationsResolverOpts,
): Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>> =>
  AggregateRelationsMixin(DTOClass, relations)(BaseServiceResolver);
