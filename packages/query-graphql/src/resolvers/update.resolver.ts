import { Class, DeepPartial, UpdateMany, UpdateManyResponse, UpdateOne } from '@nestjs-query/core';
import { ArgsType, InputType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { FilterType, PartialInputType, UpdateManyArgsType, UpdateManyResponseType, UpdateOneArgsType } from '../types';
import { BaseServiceResolver, ResolverOptions, ServiceResolver } from './resolver.interface';
import { ResolverMutation } from '../decorators';
import { DTONamesOpts, getDTONames, transformAndValidate } from './helpers';

export interface UpdateResolver<DTO, U extends DeepPartial<DTO>> {
  updateOne(input: UpdateOneArgsType<DTO, U>): Promise<DTO>;
  updateMany(input: UpdateManyArgsType<DTO, U>): Promise<UpdateManyResponse>;
}

export type UpdateResolverArgs<DTO, U extends DeepPartial<DTO> = DeepPartial<DTO>> = DTONamesOpts &
  ResolverOptions & {
    UpdateDTOClass?: Class<U>;
    UpdateOneArgs?: Class<UpdateOneArgsType<DTO, U>>;
    UpdateManyArgs?: Class<UpdateManyArgsType<DTO, U>>;
  };

const defaultUpdateInput = <DTO, U extends DeepPartial<DTO>>(DTOClass: Class<DTO>, baseName: string): Class<U> => {
  @InputType(`Update${baseName}`)
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  class PartialInput extends PartialInputType(DTOClass) {}

  return PartialInput as Class<U>;
};

export const Updateable = <DTO, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  args: UpdateResolverArgs<DTO, U> = {},
) => <B extends Class<ServiceResolver<DTO>>>(BaseClass: B): Class<UpdateResolver<DTO, U>> & B => {
  const { baseName, pluralBaseName } = getDTONames(args, DTOClass);
  const UMR = UpdateManyResponseType();

  const {
    UpdateDTOClass = defaultUpdateInput(DTOClass, baseName),
    UpdateOneArgs = UpdateOneArgsType(UpdateDTOClass),
    UpdateManyArgs = UpdateManyArgsType(FilterType(DTOClass), UpdateDTOClass),
  } = args;

  const commonResolverOptions = omit(
    args,
    'dtoName',
    'one',
    'many',
    'UpdateDTOClass',
    'UpdateOneArgs',
    'UpdateManyArgs',
  );

  @ArgsType()
  class UO extends UpdateOneArgs {}

  @ArgsType()
  class UM extends UpdateManyArgs {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ResolverBase extends BaseClass {
    @ResolverMutation(() => DTOClass, { name: `updateOne${baseName}` }, commonResolverOptions, args.one ?? {})
    async updateOne(@Args() input: UO): Promise<DTO> {
      const updateOne = await transformAndValidate(UO, input as DeepPartial<UO>);
      return this.service.updateOne(ResolverBase.transformUpdateOneArgs(updateOne));
    }

    @ResolverMutation(() => UMR, { name: `updateMany${pluralBaseName}` }, commonResolverOptions, args.many ?? {})
    async updateMany(@Args() input: UM): Promise<UpdateManyResponse> {
      const updateMany = await transformAndValidate(UM, input as DeepPartial<UM>);
      return this.service.updateMany(ResolverBase.transformUpdateManyArgs(updateMany));
    }

    static transformUpdateOneArgs(uo: UO): UpdateOne<DTO, DeepPartial<DTO>> {
      return { id: uo.id, update: uo.input };
    }

    static transformUpdateManyArgs(um: UM): UpdateMany<DTO, DeepPartial<DTO>> {
      return { filter: um.filter, update: um.input };
    }
  }

  return ResolverBase;
};

type UpdateResolverType<DTO, U extends DeepPartial<DTO>> = Class<UpdateResolver<DTO, U>> &
  Class<BaseServiceResolver<DTO>>;

export const UpdateResolver = <DTO, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  args: UpdateResolverArgs<DTO, U> = {},
): UpdateResolverType<DTO, U> => Updateable(DTOClass, args)(BaseServiceResolver);
