import { Class } from '@nestjs-query/core';
import { ArgsType } from 'type-graphql';
import { Resolver, Parent, Args } from '@nestjs/graphql';
import { ResolverProperty } from '../../decorators';
import { ConnectionType, QueryArgsType } from '../../types';
import { getDTONames, transformAndValidate } from '../helpers';
import { ResolverRelation, RelationsOpts, ServiceResolver, BaseServiceResolver } from '../resolver.interface';
import { flattenRelations, removeRelationOpts } from './helpers';

const ReadOneRelationMixin = <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  if (relation.disableRead) {
    return Base;
  }
  const commonResolverOpts = removeRelationOpts(relation);
  const relationDTO = relation.DTO;
  const { baseNameLower, baseName } = getDTONames({ dtoName: relation.dtoName }, relationDTO);
  const relationName = relation.relationName ?? baseNameLower;
  @Resolver(() => DTOClass, { isAbstract: true })
  class Mixin extends Base {
    @ResolverProperty(baseNameLower, () => relationDTO, { nullable: relation.nullable }, commonResolverOpts)
    [`find${baseName}`](@Parent() dto: DTO): Promise<Relation | undefined> {
      return this.service.findRelation(dto, relationName);
    }
  }
  return Mixin;
};

const ReadManyRelationMixin = <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  if (relation.disableRead) {
    return Base;
  }
  const commonResolverOpts = removeRelationOpts(relation);
  const relationDTO = relation.DTO;
  const { pluralBaseNameLower, pluralBaseName } = getDTONames({ dtoName: relation.dtoName }, relationDTO);
  const relationName = relation.relationName ?? pluralBaseNameLower;
  @ArgsType()
  class RelationQA extends QueryArgsType(relationDTO) {}

  const CT = ConnectionType(relationDTO);
  @Resolver(() => DTOClass, { isAbstract: true })
  class Mixin extends Base {
    @ResolverProperty(pluralBaseNameLower, () => CT, { nullable: relation.nullable }, commonResolverOpts)
    async [`query${pluralBaseName}`](@Parent() dto: DTO, @Args() q: RelationQA): Promise<ConnectionType<Relation>> {
      const qa = await transformAndValidate(RelationQA, q);
      return CT.createFromPromise(this.service.queryRelations(dto, relationName, qa), qa.paging || {});
    }
  }
  return Mixin;
};

export const ReadRelationsMixin = <DTO>(DTOClass: Class<DTO>, relations: RelationsOpts) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  const manyRelations = flattenRelations(relations.many ?? {});
  const oneRelations = flattenRelations(relations.one ?? {});
  const WithMany = manyRelations.reduce((RB, a) => ReadManyRelationMixin(DTOClass, a)(RB), Base);
  return oneRelations.reduce((RB, a) => ReadOneRelationMixin(DTOClass, a)(RB), WithMany);
};

export const ReadRelationsResolver = <DTO>(
  DTOClass: Class<DTO>,
  relations: RelationsOpts,
): Class<ServiceResolver<DTO>> => {
  return ReadRelationsMixin(DTOClass, relations)(BaseServiceResolver);
};
