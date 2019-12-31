import { Class, DeepPartial, DeleteMany, DeleteOne, Filter } from '@nestjs-query/core';
import { InputType, ObjectType } from 'type-graphql';
import { DeleteManyInputType, DeleteOneInputType, PartialType } from '../../types';

export type DeleteResolverTypesOpts<DTO, D extends DeepPartial<DTO>> = {
  typeName?: string;
  DeleteType?: () => Class<D>;
  FilterType: Class<Filter<DTO>>;
};

export type DeleteResolverTypes<DTO, D extends DeepPartial<DTO>> = {
  DeleteType: Class<D>;
  DeleteOneInputType: Class<DeleteOne>;
  DeleteManyInputType: Class<DeleteMany<DTO>>;
};

const defaultDeleteType = <DTO, D extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  baseName: string,
): (() => Class<D>) => {
  return (): Class<D> => {
    @ObjectType(`Delete${baseName}Partial`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    class PartialObj extends PartialType(DTOClass) {}

    return PartialObj as Class<D>;
  };
};

export function deleteResolverTypesFactory<DTO, D extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  opts: DeleteResolverTypesOpts<DTO, D>,
): DeleteResolverTypes<DTO, D> {
  const baseName = opts.typeName ?? DTOClass.name;

  const { DeleteType = defaultDeleteType<DTO, D>(DTOClass, baseName) } = opts;

  @InputType(`${baseName}DeleteOneInput`)
  class DeleteOneInputTypeImpl extends DeleteOneInputType() {}

  @InputType(`${baseName}DeleteManyInput`)
  class DeleteManyInputTypeImpl extends DeleteManyInputType(opts.FilterType) {}

  return {
    DeleteType: DeleteType(),
    DeleteOneInputType: DeleteOneInputTypeImpl,
    DeleteManyInputType: DeleteManyInputTypeImpl,
  };
}
