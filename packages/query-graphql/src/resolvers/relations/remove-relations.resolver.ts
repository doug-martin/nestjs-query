import { Class } from '@nestjs-query/core';
import { Resolver, ArgsType, Args, Context } from '@nestjs/graphql';
import { getDTONames } from '../../common';
import { ResolverMutation } from '../../decorators';
import { MutationArgsType, RelationInputType, RelationsInputType } from '../../types';
import { transformAndValidate } from '../helpers';
import { ServiceResolver, BaseServiceResolver } from '../resolver.interface';
import { flattenRelations, getModifyRelationOptions, removeRelationOpts } from './helpers';
import { RelationsOpts, ResolverRelation } from './relations.interface';

const RemoveOneRelationMixin = <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) => <
  B extends Class<ServiceResolver<DTO, unknown, unknown>>
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
  class RemoveOneMixin extends Base {
    @ResolverMutation(() => DTOClass, {}, commonResolverOpts)
    async [`remove${baseName}From${dtoNames.baseName}`](
      @Args() setArgs: SetArgs,
      @Context() context?: unknown,
    ): Promise<DTO> {
      const { input } = await transformAndValidate(SetArgs, setArgs);
      const opts = await getModifyRelationOptions(baseNameLower, this.authorizer, context);
      return this.service.removeRelation(relationName, input.id, input.relationId, opts);
    }
  }
  return RemoveOneMixin;
};

const RemoveManyRelationsMixin = <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) => <
  B extends Class<ServiceResolver<DTO, unknown, unknown>>
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
    async [`remove${pluralBaseName}From${dtoNames.baseName}`](
      @Args() addArgs: AddArgs,
      @Context() context?: unknown,
    ): Promise<DTO> {
      const { input } = await transformAndValidate(AddArgs, addArgs);
      const opts = await getModifyRelationOptions(pluralBaseNameLower, this.authorizer, context);
      return this.service.removeRelations(relationName, input.id, input.relationIds, opts);
    }
  }
  return Mixin;
};

export const RemoveRelationsMixin = <DTO>(DTOClass: Class<DTO>, relations: RelationsOpts) => <
  B extends Class<ServiceResolver<DTO, unknown, unknown>>
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
): Class<ServiceResolver<DTO, unknown, unknown>> => {
  return RemoveRelationsMixin(DTOClass, relations)(BaseServiceResolver);
};
