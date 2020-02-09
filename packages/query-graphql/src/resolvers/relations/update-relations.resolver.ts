import { Class } from '@nestjs-query/core';
import { ArgsType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import { ResolverMutation } from '../../decorators';
import { RelationsArgsType, RelationArgsType } from '../../types';
import { getDTONames, transformAndValidate } from '../helpers';
import { ResolverRelation, RelationsOpts, ServiceResolver, BaseServiceResolver } from '../resolver.interface';
import { flattenRelations, removeRelationOpts } from './helpers';

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
  const dtoNames = getDTONames({}, DTOClass);
  const { baseNameLower, baseName } = getDTONames({ dtoName: relation.dtoName }, relationDTO);
  const relationName = relation.relationName ?? baseNameLower;
  @ArgsType()
  class SetArgs extends RelationArgsType() {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class Mixin extends Base {
    @ResolverMutation(() => DTOClass, {}, commonResolverOpts)
    async [`set${baseName}On${dtoNames.baseName}`](@Args() input: SetArgs): Promise<DTO> {
      const args = await transformAndValidate(SetArgs, input);
      return this.service.setRelation(relationName, args.id, args.relationId);
    }
  }
  return Mixin;
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
  const dtoNames = getDTONames({}, DTOClass);
  const { pluralBaseNameLower, pluralBaseName } = getDTONames({ dtoName: relation.dtoName }, relationDTO);
  const relationName = relation.relationName ?? pluralBaseNameLower;
  @ArgsType()
  class AddArgs extends RelationsArgsType() {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class Mixin extends Base {
    @ResolverMutation(() => DTOClass, {}, commonResolverOpts)
    async [`add${pluralBaseName}To${dtoNames.baseName}`](@Args() input: AddArgs): Promise<DTO> {
      const args = await transformAndValidate(AddArgs, input);
      return this.service.addRelations(relationName, args.id, args.relationIds);
    }
  }
  return Mixin;
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
