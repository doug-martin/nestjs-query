import { DeepPartial, Filter, Class } from '@nestjs-query/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { getDTONames } from '../common';
import { getMetadataStorage } from '../metadata';
import { FilterType } from './query';

export interface UpdateManyInputType<DTO, U extends DeepPartial<DTO>> {
  filter: Filter<DTO>;
  update: U;
}

export function UpdateManyInputType<DTO, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  UpdateType: Class<U>,
): Class<UpdateManyInputType<DTO, U>> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getUpdateManyInputType<DTO, U>(DTOClass);
  if (existing) {
    return existing;
  }
  const { pluralBaseName } = getDTONames(DTOClass);
  const F = FilterType(DTOClass);

  @InputType(`UpdateMany${pluralBaseName}Input`)
  class UpdateManyInput implements UpdateManyInputType<DTO, U> {
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => F)
    @Field(() => F, { description: 'Filter used to find fields to update' })
    filter!: Filter<DTO>;

    @Type(() => UpdateType)
    @ValidateNested()
    @Field(() => UpdateType, { description: 'The update to apply to all records found using the filter' })
    update!: U;
  }
  metadataStorage.addUpdateManyInputType(DTOClass, UpdateManyInput);

  return UpdateManyInput;
}
