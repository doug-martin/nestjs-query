import { Class, DeepPartial, UpdateManyResponse } from '@nestjs-query/core';
import { ArgsType, InputType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { FilterType, PartialInputType, UpdateManyArgsType, UpdateManyResponseType, UpdateOneArgsType } from '../types';
import { BaseServiceResolver, ResolverClass, ResolverOpts, ServiceResolver } from './resolver.interface';
import { ResolverMutation } from '../decorators';
import { DTONamesOpts, getDTONames, transformAndValidate } from './helpers';

export interface UpdateResolverOpts<DTO, U extends DeepPartial<DTO> = DeepPartial<DTO>>
  extends DTONamesOpts,
    ResolverOpts {
  UpdateDTOClass?: Class<U>;
  UpdateOneArgs?: Class<UpdateOneArgsType<DTO, U>>;
  UpdateManyArgs?: Class<UpdateManyArgsType<DTO, U>>;
}

export interface UpdateResolver<DTO, U extends DeepPartial<DTO>> extends ServiceResolver<DTO> {
  updateOne(input: UpdateOneArgsType<DTO, U>): Promise<DTO>;
  updateMany(input: UpdateManyArgsType<DTO, U>): Promise<UpdateManyResponse>;
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
  const { baseName, pluralBaseName } = getDTONames(opts, DTOClass);
  const UMR = UpdateManyResponseType();

  const {
    UpdateDTOClass = defaultUpdateInput(DTOClass, baseName),
    UpdateOneArgs = UpdateOneArgsType(UpdateDTOClass),
    UpdateManyArgs = UpdateManyArgsType(FilterType(DTOClass), UpdateDTOClass),
  } = opts;

  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'UpdateDTOClass', 'UpdateOneArgs', 'UpdateManyArgs');

  @ArgsType()
  class UO extends UpdateOneArgs {}

  @ArgsType()
  class UM extends UpdateManyArgs {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ResolverBase extends BaseClass {
    @ResolverMutation(() => DTOClass, { name: `updateOne${baseName}` }, commonResolverOpts, opts.one ?? {})
    async updateOne(@Args() input: UO): Promise<DTO> {
      const updateOne = await transformAndValidate(UO, input);
      return this.service.updateOne(updateOne.id, updateOne.input);
    }

    @ResolverMutation(() => UMR, { name: `updateMany${pluralBaseName}` }, commonResolverOpts, opts.many ?? {})
    async updateMany(@Args() input: UM): Promise<UpdateManyResponse> {
      const updateMany = await transformAndValidate(UM, input);
      return this.service.updateMany(updateMany.input, updateMany.filter);
    }
  }

  return ResolverBase;
};

export const UpdateResolver = <DTO, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  opts: UpdateResolverOpts<DTO, U> = {},
): ResolverClass<DTO, UpdateResolver<DTO, U>> => Updateable(DTOClass, opts)(BaseServiceResolver);
