// eslint-disable-next-line max-classes-per-file
import { Class, ModifyRelationOptions, QueryService } from '@nestjs-query/core';
import { Resolver, ArgsType, Args, InputType } from '@nestjs/graphql';
import { AuthorizerInterceptor } from '../../interceptors';
import { getDTONames } from '../../common';
import { ModifyRelationAuthorizerFilter, ResolverMutation } from '../../decorators';
import { MutationArgsType, RelationInputType, RelationsInputType } from '../../types';
import { transformAndValidate } from '../helpers';
import { ServiceResolver, BaseServiceResolver } from '../resolver.interface';
import { flattenRelations, removeRelationOpts } from './helpers';
import { RelationsOpts, ResolverRelation } from './relations.interface';
import { OperationGroup } from '../../auth';

const UpdateOneRelationMixin =
  <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    if (relation.disableUpdate) {
      return Base;
    }
    const commonResolverOpts = removeRelationOpts(relation);
    const relationDTO = relation.DTO;
    const dtoNames = getDTONames(DTOClass);
    const { baseNameLower, baseName } = getDTONames(relationDTO, { dtoName: relation.dtoName });
    const relationName = relation.relationName ?? baseNameLower;
    @InputType(`Set${baseName}On${dtoNames.baseName}Input`)
    class RIT extends RelationInputType(DTOClass, relationDTO) {}
    @ArgsType()
    class SetArgs extends MutationArgsType(RIT) {}

    @Resolver(() => DTOClass, { isAbstract: true })
    class UpdateOneMixin extends Base {
      @ResolverMutation(() => DTOClass, {}, commonResolverOpts, {
        interceptors: [AuthorizerInterceptor(DTOClass)],
      })
      async [`set${baseName}On${dtoNames.baseName}`](
        @Args() setArgs: SetArgs,
        @ModifyRelationAuthorizerFilter(baseNameLower, {
          operationGroup: OperationGroup.UPDATE,
          many: false,
        })
        modifyRelationsFilter?: ModifyRelationOptions<DTO, Relation>,
      ): Promise<DTO> {
        const { input } = await transformAndValidate(SetArgs, setArgs);
        return this.service.setRelation(relationName, input.id, input.relationId, modifyRelationsFilter);
      }
    }
    return UpdateOneMixin;
  };

const UpdateManyRelationMixin =
  <DTO, Relation>(DTOClass: Class<DTO>, relation: ResolverRelation<Relation>) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    if (relation.disableUpdate) {
      return Base;
    }
    const commonResolverOpts = removeRelationOpts(relation);
    const relationDTO = relation.DTO;
    const dtoNames = getDTONames(DTOClass);
    const { pluralBaseNameLower, pluralBaseName } = getDTONames(relationDTO, { dtoName: relation.dtoName });
    const relationName = relation.relationName ?? pluralBaseNameLower;
    @InputType(`Add${pluralBaseName}To${dtoNames.baseName}Input`)
    class AddRelationInput extends RelationsInputType(DTOClass, relationDTO) {}
    @ArgsType()
    class AddArgs extends MutationArgsType(AddRelationInput) {}

    @InputType(`Set${pluralBaseName}On${dtoNames.baseName}Input`)
    class SetRelationInput extends RelationsInputType(DTOClass, relationDTO) {}
    @ArgsType()
    class SetArgs extends MutationArgsType(SetRelationInput) {}

    @Resolver(() => DTOClass, { isAbstract: true })
    class UpdateManyMixin extends Base {
      @ResolverMutation(() => DTOClass, {}, commonResolverOpts, {
        interceptors: [AuthorizerInterceptor(DTOClass)],
      })
      async [`add${pluralBaseName}To${dtoNames.baseName}`](
        @Args() addArgs: AddArgs,
        @ModifyRelationAuthorizerFilter(pluralBaseNameLower, {
          operationGroup: OperationGroup.UPDATE,
          many: true,
        })
        modifyRelationsFilter?: ModifyRelationOptions<DTO, Relation>,
      ): Promise<DTO> {
        const { input } = await transformAndValidate(AddArgs, addArgs);
        return this.service.addRelations(relationName, input.id, input.relationIds, modifyRelationsFilter);
      }

      @ResolverMutation(() => DTOClass, {}, commonResolverOpts, {
        interceptors: [AuthorizerInterceptor(DTOClass)],
      })
      async [`set${pluralBaseName}On${dtoNames.baseName}`](
        @Args() addArgs: SetArgs,
        @ModifyRelationAuthorizerFilter(pluralBaseNameLower, {
          operationGroup: OperationGroup.UPDATE,
          many: true,
        })
        modifyRelationsFilter?: ModifyRelationOptions<DTO, Relation>,
      ): Promise<DTO> {
        const { input } = await transformAndValidate(AddArgs, addArgs);
        return this.service.setRelations(relationName, input.id, input.relationIds, modifyRelationsFilter);
      }
    }
    return UpdateManyMixin;
  };

export const UpdateRelationsMixin =
  <DTO>(DTOClass: Class<DTO>, relations: RelationsOpts) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    const manyRelations = flattenRelations(relations.many ?? {});
    const oneRelations = flattenRelations(relations.one ?? {});

    const WithMany = manyRelations.reduce((RB, a) => UpdateManyRelationMixin(DTOClass, a)(RB), Base);
    return oneRelations.reduce((RB, a) => UpdateOneRelationMixin(DTOClass, a)(RB), WithMany);
  };

export const UpdateRelationsResolver = <
  DTO,
  QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>,
>(
  DTOClass: Class<DTO>,
  relations: RelationsOpts,
): Class<ServiceResolver<DTO, QS>> => UpdateRelationsMixin(DTOClass, relations)(BaseServiceResolver);
