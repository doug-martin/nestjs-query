import { DeepPartial, UpdateMany, UpdateOne, Filter } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { InputType } from 'type-graphql';
import { GraphQLUpdateManyInput, GraphQLUpdateOneInput, PartialInputType } from '../../types';

export type UpdateResolverTypesOpts<DTO, U extends DeepPartial<DTO>> = {
  name?: string;
  UpdateType?: () => Type<U>;
  FilterType: Type<Filter<DTO>>;
};

export type UpdateResolverTypes<DTO, U extends DeepPartial<DTO>> = {
  UpdateInputType: Type<U>;
  UpdateOneInputType: Type<UpdateOne<DTO, U>>;
  UpdateManyInputType: Type<UpdateMany<DTO, U>>;
};

const defaultUpdateInput = <DTO, U extends DeepPartial<DTO>>(
  DTOClass: Type<DTO>,
  baseName: string,
): (() => Type<U>) => {
  return (): Type<U> => {
    @InputType(`Update${baseName}PartialInput`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    class PartialInput extends PartialInputType(DTOClass) {}

    return PartialInput as Type<U>;
  };
};

export function updateResolverTypesFactory<DTO, U extends DeepPartial<DTO>>(
  DTOClass: Type<DTO>,
  opts: UpdateResolverTypesOpts<DTO, U>,
): UpdateResolverTypes<DTO, U> {
  const baseName = opts.name ? opts.name : DTOClass.name;

  const { UpdateType = defaultUpdateInput<DTO, U>(DTOClass, baseName) } = opts;
  const UpdateInputType: Type<U> = UpdateType();

  @InputType(`${baseName}UpdateOneInput`)
  class UpdateOneInputType extends GraphQLUpdateOneInput(UpdateInputType) {}

  @InputType(`${baseName}UpdateManyInput`)
  class UpdateManyInputType extends GraphQLUpdateManyInput(opts.FilterType, UpdateInputType) {}

  return { UpdateInputType, UpdateOneInputType, UpdateManyInputType };
}
