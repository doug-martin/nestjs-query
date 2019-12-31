import { DeepPartial, UpdateMany, UpdateOne, Filter, Class } from '@nestjs-query/core';
import { InputType } from 'type-graphql';
import { PartialInputType, UpdateManyInputType, UpdateOneInputType } from '../../types';

export type UpdateResolverTypesOpts<DTO, U extends DeepPartial<DTO>> = {
  typeName?: string;
  UpdateType?: () => Class<U>;
  FilterType: Class<Filter<DTO>>;
};

export type UpdateResolverTypes<DTO, U extends DeepPartial<DTO>> = {
  UpdateInputType: Class<U>;
  UpdateOneInputType: Class<UpdateOne<DTO, U>>;
  UpdateManyInputType: Class<UpdateMany<DTO, U>>;
};

const defaultUpdateInput = <DTO, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  baseName: string,
): (() => Class<U>) => {
  return (): Class<U> => {
    @InputType(`Update${baseName}PartialInput`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    class PartialInput extends PartialInputType(DTOClass) {}

    return PartialInput as Class<U>;
  };
};

export function updateResolverTypesFactory<DTO, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  opts: UpdateResolverTypesOpts<DTO, U>,
): UpdateResolverTypes<DTO, U> {
  const baseName = opts.typeName ?? DTOClass.name;

  const { UpdateType = defaultUpdateInput<DTO, U>(DTOClass, baseName) } = opts;
  const UpdateInputType: Class<U> = UpdateType();

  @InputType(`${baseName}UpdateOneInput`)
  class UpdateOneInputTypeImpl extends UpdateOneInputType(UpdateInputType) {}

  @InputType(`${baseName}UpdateManyInput`)
  class UpdateManyInputTypeImpl extends UpdateManyInputType(opts.FilterType, UpdateInputType) {}

  return { UpdateInputType, UpdateOneInputType: UpdateOneInputTypeImpl, UpdateManyInputType: UpdateManyInputTypeImpl };
}
