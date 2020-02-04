import { Class } from '@nestjs-query/core';
import { ArgsType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import { ResolverMutation } from '../../decorators';
import { RelationsArgsType, RelationArgsType } from '../../types';
import { getDTONames } from '../helpers';
import { ResolverRelation, RelationsOpts, ServiceResolver, BaseServiceResolver } from '../resolver.interface';
import { flattenRelations, removeRelationOpts } from './helpers';

const RemoveOneRelationMixin = <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  if (relation.disableRemove) {
    return Base;
  }
  const commonResolverOpts = removeRelationOpts(relation);
  const relationDTO = relation.DTO;
  const dtoNames = getDTONames({}, DTOClass);
  const { baseNameLower, baseName } = getDTONames({ dtoName: relation.dtoName }, relationDTO);
  const relationName = relation.relationName ?? baseNameLower;
  @ArgsType()
  class SetArgs extends RelationArgsType() {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class Mixin extends Base {
    @ResolverMutation(() => DTOClass, {}, commonResolverOpts)
    [`remove${baseName}From${dtoNames.baseName}`](@Args() input: SetArgs): Promise<DTO> {
      return this.service.removeRelation(input.id, relationName, input.relationId);
    }
  }
  return Mixin;
};

const RemoveManyRelationsMixin = <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  if (relation.disableRemove) {
    return Base;
  }
  const commonResolverOpts = removeRelationOpts(relation);
  const relationDTO = relation.DTO;
  const dtoNames = getDTONames({}, DTOClass);
  const { pluralBaseNameLower, pluralBaseName } = getDTONames({ dtoName: relation.dtoName }, relationDTO);
  const relationName = relation.relationName ?? pluralBaseNameLower;
  @ArgsType()
  class AddArgs extends RelationsArgsType() {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class Mixin extends Base {
    @ResolverMutation(() => DTOClass, {}, commonResolverOpts)
    [`remove${pluralBaseName}From${dtoNames.baseName}`](@Args() input: AddArgs): Promise<DTO> {
      return this.service.removeRelations(input.id, relationName, input.relationIds);
    }
  }
  return Mixin;
};

export const RemoveRelationsMixin = <DTO>(DTOClass: Class<DTO>, relations: RelationsOpts) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  const manyRelations = flattenRelations(relations.many ?? {});
  const oneRelations = flattenRelations(relations.one ?? {});

  const WithMany = manyRelations.reduce((RB, a) => RemoveManyRelationsMixin(DTOClass, a)(RB), Base);
  return oneRelations.reduce((RB, a) => RemoveOneRelationMixin(DTOClass, a)(RB), WithMany);
};

export const RemoveRelationsResolver = <DTO>(
  DTOClass: Class<DTO>,
  relations: RelationsOpts,
): Class<ServiceResolver<DTO>> => {
  return RemoveRelationsMixin(DTOClass, relations)(BaseServiceResolver);
};
