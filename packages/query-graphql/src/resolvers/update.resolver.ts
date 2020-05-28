// eslint-disable-next-line max-classes-per-file
import { Class, DeepPartial, UpdateManyResponse } from '@nestjs-query/core';
import { ArgsType, InputType, Resolver, Args, PartialType } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { DTONames, getDTONames } from '../common';
import { MutationArgsType, UpdateManyInputType, UpdateManyResponseType, UpdateOneInputType } from '../types';
import { BaseServiceResolver, ResolverClass, ResolverOpts, ServiceResolver } from './resolver.interface';
import { ResolverMutation } from '../decorators';
import { transformAndValidate } from './helpers';

export interface UpdateResolverOpts<DTO, U extends DeepPartial<DTO> = DeepPartial<DTO>> extends ResolverOpts {
  UpdateDTOClass?: Class<U>;
  UpdateOneInput?: Class<UpdateOneInputType<U>>;
  UpdateManyInput?: Class<UpdateManyInputType<DTO, U>>;
}

export interface UpdateResolver<DTO, U extends DeepPartial<DTO>> extends ServiceResolver<DTO> {
  updateOne(input: MutationArgsType<UpdateOneInputType<U>>): Promise<DTO>;
  updateMany(input: MutationArgsType<UpdateManyInputType<DTO, U>>): Promise<UpdateManyResponse>;
}

/** @internal */
const defaultUpdateInput = <DTO, U extends DeepPartial<DTO>>(dtoNames: DTONames, DTOClass: Class<DTO>): Class<U> => {
  @InputType(`Update${dtoNames.baseName}`)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  class UpdateType extends PartialType(DTOClass, InputType) {}

  return UpdateType as Class<U>;
};

/** @internal */
const defaultUpdateOneInput = <U>(dtoNames: DTONames, UpdateDTO: Class<U>): Class<UpdateOneInputType<U>> => {
  const { baseName } = dtoNames;
  @InputType(`UpdateOne${baseName}Input`)
  class UM extends UpdateOneInputType(UpdateDTO) {}
  return UM;
};

/** @internal */
const defaultUpdateManyInput = <DTO, U extends DeepPartial<DTO>>(
  dtoNames: DTONames,
  DTOClass: Class<DTO>,
  UpdateDTO: Class<U>,
): Class<UpdateManyInputType<DTO, U>> => {
  const { pluralBaseName } = dtoNames;
  @InputType(`UpdateMany${pluralBaseName}Input`)
  class UM extends UpdateManyInputType(DTOClass, UpdateDTO) {}
  return UM;
};

/**
 * @internal
 * Mixin to add `update` graphql endpoints.
 */
export const Updateable = <DTO, U extends DeepPartial<DTO>>(DTOClass: Class<DTO>, opts: UpdateResolverOpts<DTO, U>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<UpdateResolver<DTO, U>> & B => {
  const dtoNames = getDTONames(DTOClass, opts);
  const { baseName, pluralBaseName } = dtoNames;
  const UMR = UpdateManyResponseType();

  const {
    UpdateDTOClass = defaultUpdateInput(dtoNames, DTOClass),
    UpdateOneInput = defaultUpdateOneInput(dtoNames, UpdateDTOClass),
    UpdateManyInput = defaultUpdateManyInput(dtoNames, DTOClass, UpdateDTOClass),
  } = opts;

  const commonResolverOpts = omit(
    opts,
    'dtoName',
    'one',
    'many',
    'UpdateDTOClass',
    'UpdateOneInput',
    'UpdateManyInput',
  );

  @ArgsType()
  class UO extends MutationArgsType(UpdateOneInput) {}

  @ArgsType()
  class UM extends MutationArgsType(UpdateManyInput) {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class UpdateResolverBase extends BaseClass {
    @ResolverMutation(() => DTOClass, { name: `updateOne${baseName}` }, commonResolverOpts, opts.one ?? {})
    async updateOne(@Args() input: UO): Promise<DTO> {
      const updateOne = await transformAndValidate(UO, input);
      const { id, update } = updateOne.input;
      return this.service.updateOne(id, update);
    }

    @ResolverMutation(() => UMR, { name: `updateMany${pluralBaseName}` }, commonResolverOpts, opts.many ?? {})
    async updateMany(@Args() input: UM): Promise<UpdateManyResponse> {
      const updateMany = await transformAndValidate(UM, input);
      const { update, filter } = updateMany.input;
      return this.service.updateMany(update, filter);
    }
  }
  return UpdateResolverBase;
};

export const UpdateResolver = <DTO, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  opts: UpdateResolverOpts<DTO, U> = {},
): ResolverClass<DTO, UpdateResolver<DTO, U>> => Updateable(DTOClass, opts)(BaseServiceResolver);
