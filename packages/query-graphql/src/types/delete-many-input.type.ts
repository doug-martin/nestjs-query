import { Filter, Class } from '@nestjs-query/core';
import { Field, InputType } from 'type-graphql';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { getDTONames } from '../common';
import { getMetadataStorage } from '../metadata';
import { FilterType } from './query';

export interface DeleteManyInputType<T> {
  filter: Filter<T>;
}

export function DeleteManyInputType<DTO>(DTOClass: Class<DTO>): Class<DeleteManyInputType<DTO>> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getDeleteManyInputType(DTOClass);
  if (existing) {
    return existing;
  }
  const { pluralBaseName } = getDTONames(DTOClass);
  const F = FilterType(DTOClass);
  @InputType(`DeleteMany${pluralBaseName}Input`)
  class DeleteManyInput implements DeleteManyInputType<DTO> {
    @IsNotEmptyObject()
    @Type(() => F)
    @ValidateNested()
    @Field(() => F, { description: 'Filter to find records to delete' })
    filter!: Filter<DTO>;
  }
  metadataStorage.addDeleteManyInputType(DTOClass, DeleteManyInput);
  return DeleteManyInput;
}
