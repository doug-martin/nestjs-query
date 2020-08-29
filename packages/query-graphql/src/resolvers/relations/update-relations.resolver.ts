import { Class } from '@nestjs-query/core';
import { Resolver, ArgsType, Args, Context } from '@nestjs/graphql';
import { getDTONames } from '../../common';
import { ResolverMutation } from '../../decorators';
import { MutationArgsType, RelationInputType, RelationsInputType } from '../../types';
import { transformAndValidate } from '../helpers';
import { ServiceResolver, BaseServiceResolver } from '../resolver.interface';
import { flattenRelations, getModifyRelationOptions, removeRelationOpts } from './helpers';
import { RelationsOpts, ResolverRelation } from './relations.interface';

const UpdateOneRelationMixin = <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  if (relation.disableUpdate) {
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
  class UpdateOneMixin extends Base {
    @ResolverMutation(() => DTOClass, {}, commonResolverOpts)
    async [`set${baseName}On${dtoNames.baseName}`](
      @Args() setArgs: SetArgs,
      @Context() context?: unknown,
    ): Promise<DTO> {
      const { input } = await transformAndValidate(SetArgs, setArgs);
      const opts = await getModifyRelationOptions(baseNameLower, this.authorizer, context);
      return this.service.setRelation(relationName, input.id, input.relationId, opts);
    }
  }
  return UpdateOneMixin;
};

const UpdateManyRelationMixin = <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  if (relation.disableUpdate) {
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
  class UpdateManyMixin extends Base {
    @ResolverMutation(() => DTOClass, {}, commonResolverOpts)
    async [`add${pluralBaseName}To${dtoNames.baseName}`](
      @Args() addArgs: AddArgs,
      @Context() context?: unknown,
    ): Promise<DTO> {
      const { input } = await transformAndValidate(AddArgs, addArgs);
      const opts = await getModifyRelationOptions(pluralBaseNameLower, this.authorizer, context);
      return this.service.addRelations(relationName, input.id, input.relationIds, opts);
    }
  }
  return UpdateManyMixin;
};

export const UpdateRelationsMixin = <DTO>(DTOClass: Class<DTO>, relations: RelationsOpts) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  const manyRelations = flattenRelations(relations.many ?? {});
  const oneRelations = flattenRelations(relations.one ?? {});

  const WithMany = manyRelations.reduce((RB, a) => UpdateManyRelationMixin(DTOClass, a)(RB), Base);
  return oneRelations.reduce((RB, a) => UpdateOneRelationMixin(DTOClass, a)(RB), WithMany);
};

export const UpdateRelationsResolver = <DTO>(
  DTOClass: Class<DTO>,
  relations: RelationsOpts,
): Class<ServiceResolver<DTO>> => {
  return UpdateRelationsMixin(DTOClass, relations)(BaseServiceResolver);
};
