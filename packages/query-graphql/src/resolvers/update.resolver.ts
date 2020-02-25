import { Class, DeepPartial, UpdateManyResponse } from '@nestjs-query/core';
import { ArgsType, InputType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { getDTONames } from '../common';
import {
  MutationArgsType,
  PartialInputType,
  UpdateManyInputType,
  UpdateManyResponseType,
  UpdateOneInputType,
} from '../types';
import { BaseServiceResolver, ResolverClass, ResolverOpts, ServiceResolver } from './resolver.interface';
import { ResolverMutation } from '../decorators';
import { transformAndValidate } from './helpers';

export interface UpdateResolverOpts<DTO, U extends DeepPartial<DTO> = DeepPartial<DTO>> extends ResolverOpts {
  UpdateDTOClass?: Class<U>;
  UpdateOneInput?: Class<UpdateOneInputType<DTO, U>>;
  UpdateManyInput?: Class<UpdateManyInputType<DTO, U>>;
}

export interface UpdateResolver<DTO, U extends DeepPartial<DTO>> extends ServiceResolver<DTO> {
  updateOne(input: MutationArgsType<UpdateOneInputType<DTO, U>>): Promise<DTO>;
  updateMany(input: MutationArgsType<UpdateManyInputType<DTO, U>>): Promise<UpdateManyResponse>;
}

/** @internal */
const defaultUpdateInput = <DTO, U extends DeepPartial<DTO>>(DTOClass: Class<DTO>, baseName: string): Class<U> => {
  @InputType(`Update${baseName}`)
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  class PartialInput extends PartialInputType(DTOClass) {}

  return PartialInput as Class<U>;
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
  const { baseName, pluralBaseName } = getDTONames(DTOClass, opts);
  const UMR = UpdateManyResponseType();

  const {
    UpdateDTOClass = defaultUpdateInput(DTOClass, baseName),
    UpdateOneInput = UpdateOneInputType(DTOClass, UpdateDTOClass),
    UpdateManyInput = UpdateManyInputType(DTOClass, UpdateDTOClass),
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
  class ResolverBase extends BaseClass {
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

  return ResolverBase;
};

export const UpdateResolver = <DTO, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  opts: UpdateResolverOpts<DTO, U> = {},
): ResolverClass<DTO, UpdateResolver<DTO, U>> => Updateable(DTOClass, opts)(BaseServiceResolver);
