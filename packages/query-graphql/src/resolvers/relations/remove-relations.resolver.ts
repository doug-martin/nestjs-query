// eslint-disable-next-line max-classes-per-file
import { Class, ModifyRelationOptions, QueryService } from '@nestjs-query/core';
import { Resolver, ArgsType, Args, InputType } from '@nestjs/graphql';
import { OperationGroup } from '../../auth';
import { getDTONames } from '../../common';
import { ModifyRelationAuthorizerFilter, ResolverMutation } from '../../decorators';
import { AuthorizerInterceptor } from '../../interceptors';
import { MutationArgsType, RelationInputType, RelationsInputType } from '../../types';
import { transformAndValidate } from '../helpers';
import { ServiceResolver, BaseServiceResolver } from '../resolver.interface';
import { flattenRelations, removeRelationOpts } from './helpers';
import { RelationsOpts, ResolverRelation } from './relations.interface';

const RemoveOneRelationMixin =
  <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    if (relation.disableRemove) {
      return Base;
    }
    const commonResolverOpts = removeRelationOpts(relation);
    const relationDTO = relation.DTO;
    const dtoNames = getDTONames(DTOClass);
    const { baseNameLower, baseName } = getDTONames(relationDTO, { dtoName: relation.dtoName });
    const relationName = relation.relationName ?? baseNameLower;
    @InputType(`Remove${baseName}From${dtoNames.baseName}Input`)
    class RIT extends RelationInputType(DTOClass, relationDTO) {}
    @ArgsType()
    class SetArgs extends MutationArgsType(RIT) {}

    @Resolver(() => DTOClass, { isAbstract: true })
    class RemoveOneMixin extends Base {
      @ResolverMutation(() => DTOClass, {}, commonResolverOpts, { interceptors: [AuthorizerInterceptor(DTOClass)] })
      async [`remove${baseName}From${dtoNames.baseName}`](
        @Args() setArgs: SetArgs,
        @ModifyRelationAuthorizerFilter(baseNameLower, {
          operationGroup: OperationGroup.UPDATE,
          many: false,
        })
        modifyRelationsFilter?: ModifyRelationOptions<DTO, Relation>,
      ): Promise<DTO> {
        const { input } = await transformAndValidate(SetArgs, setArgs);
        return this.service.removeRelation(relationName, input.id, input.relationId, modifyRelationsFilter);
      }
    }
    return RemoveOneMixin;
  };

const RemoveManyRelationsMixin =
  <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    if (relation.disableRemove) {
      return Base;
    }
    const commonResolverOpts = removeRelationOpts(relation);
    const relationDTO = relation.DTO;
    const dtoNames = getDTONames(DTOClass);
    const { pluralBaseNameLower, pluralBaseName } = getDTONames(relationDTO, { dtoName: relation.dtoName });
    const relationName = relation.relationName ?? pluralBaseNameLower;
    @InputType(`Remove${pluralBaseName}From${dtoNames.baseName}Input`)
    class RIT extends RelationsInputType(DTOClass, relationDTO) {}
    @ArgsType()
    class AddArgs extends MutationArgsType(RIT) {}

    @Resolver(() => DTOClass, { isAbstract: true })
    class Mixin extends Base {
      @ResolverMutation(() => DTOClass, {}, commonResolverOpts, { interceptors: [AuthorizerInterceptor(DTOClass)] })
      async [`remove${pluralBaseName}From${dtoNames.baseName}`](
        @Args() addArgs: AddArgs,
        @ModifyRelationAuthorizerFilter(pluralBaseNameLower, {
          operationGroup: OperationGroup.UPDATE,
          many: true,
        })
        modifyRelationsFilter?: ModifyRelationOptions<DTO, Relation>,
      ): Promise<DTO> {
        const { input } = await transformAndValidate(AddArgs, addArgs);
        return this.service.removeRelations(relationName, input.id, input.relationIds, modifyRelationsFilter);
      }
    }
    return Mixin;
  };

export const RemoveRelationsMixin =
  <DTO>(DTOClass: Class<DTO>, relations: RelationsOpts) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    const manyRelations = flattenRelations(relations.many ?? {});
    const oneRelations = flattenRelations(relations.one ?? {});

    const WithMany = manyRelations.reduce((RB, a) => RemoveManyRelationsMixin(DTOClass, a)(RB), Base);
    return oneRelations.reduce((RB, a) => RemoveOneRelationMixin(DTOClass, a)(RB), WithMany);
  };

export const RemoveRelationsResolver = <
  DTO,
  QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>,
>(
  DTOClass: Class<DTO>,
  relations: RelationsOpts,
): Class<ServiceResolver<DTO, QS>> => RemoveRelationsMixin(DTOClass, relations)(BaseServiceResolver);
