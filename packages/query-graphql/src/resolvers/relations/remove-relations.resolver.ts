import { Class } from '@nestjs-query/core';
import { ArgsType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import { getDTONames } from '../../common';
import { ResolverMutation } from '../../decorators';
import { MutationArgsType, RelationInputType, RelationsInputType } from '../../types';
import { transformAndValidate } from '../helpers';
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
  const dtoNames = getDTONames(DTOClass);
  const { baseNameLower, baseName } = getDTONames(relationDTO, { dtoName: relation.dtoName });
  const relationName = relation.relationName ?? baseNameLower;
  @ArgsType()
  class SetArgs extends MutationArgsType(RelationInputType()) {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class Mixin extends Base {
    @ResolverMutation(() => DTOClass, {}, commonResolverOpts)
    async [`remove${baseName}From${dtoNames.baseName}`](@Args() setArgs: SetArgs): Promise<DTO> {
      const { input } = await transformAndValidate(SetArgs, setArgs);
      return this.service.removeRelation(relationName, input.id, input.relationId);
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
  const dtoNames = getDTONames(DTOClass);
  const { pluralBaseNameLower, pluralBaseName } = getDTONames(relationDTO, { dtoName: relation.dtoName });
  const relationName = relation.relationName ?? pluralBaseNameLower;
  @ArgsType()
  class AddArgs extends MutationArgsType(RelationsInputType()) {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class Mixin extends Base {
    @ResolverMutation(() => DTOClass, {}, commonResolverOpts)
    async [`remove${pluralBaseName}From${dtoNames.baseName}`](@Args() addArgs: AddArgs): Promise<DTO> {
      const { input } = await transformAndValidate(AddArgs, addArgs);
      return this.service.removeRelations(relationName, input.id, input.relationIds);
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
