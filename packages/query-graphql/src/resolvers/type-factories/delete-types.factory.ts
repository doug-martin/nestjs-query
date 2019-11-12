import { DeepPartial, DeleteMany, DeleteOne, Filter } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { InputType, ObjectType } from 'type-graphql';
import { GraphQLDeleteManyInput, GraphQLDeleteOneInput, PartialType } from '../../types';

export type DeleteResolverTypesOpts<DTO, D extends DeepPartial<DTO>> = {
  name?: string;
  DeleteType?: () => Type<D>;
  FilterType: Type<Filter<DTO>>;
};

export type DeleteResolverTypes<DTO, D extends DeepPartial<DTO>> = {
  DeleteType: Type<D>;
  DeleteOneInputType: Type<DeleteOne>;
  DeleteManyInputType: Type<DeleteMany<DTO>>;
};

const defaultDeleteType = <DTO, D extends DeepPartial<DTO>>(DTOClass: Type<DTO>, baseName: string): (() => Type<D>) => {
  return (): Type<D> => {
    @ObjectType(`Delete${baseName}Partial`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    class PartialObj extends PartialType(DTOClass) {}

    return PartialObj as Type<D>;
  };
};

export function deleteResolverTypesFactory<DTO, D extends DeepPartial<DTO>>(
  DTOClass: Type<DTO>,
  opts: DeleteResolverTypesOpts<DTO, D>,
): DeleteResolverTypes<DTO, D> {
  const baseName = opts.name ? opts.name : DTOClass.name;

  const { DeleteType = defaultDeleteType<DTO, D>(DTOClass, baseName) } = opts;

  @InputType(`${baseName}DeleteOneInput`)
  class DeleteOneInputType extends GraphQLDeleteOneInput() {}

  @InputType(`${baseName}DeleteManyInput`)
  class DeleteManyInputType extends GraphQLDeleteManyInput(opts.FilterType) {}

  return {
    DeleteType: DeleteType(),
    DeleteOneInputType,
    DeleteManyInputType,
  };
}
