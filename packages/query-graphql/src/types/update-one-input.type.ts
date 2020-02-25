import { DeepPartial, Class } from '@nestjs-query/core';
import { Field, ID, InputType } from 'type-graphql';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { getDTONames } from '../common';
import { getMetadataStorage } from '../metadata';

export interface UpdateOneInputType<DTO, U extends DeepPartial<DTO>> {
  id: string | number;
  update: U;
}

export function UpdateOneInputType<DTO, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  UpdateType: Class<U>,
): Class<UpdateOneInputType<DTO, U>> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getUpdateOneInputType<DTO, U>(DTOClass);
  if (existing) {
    return existing;
  }
  const { baseName } = getDTONames(DTOClass);
  @InputType(`UpdateOne${baseName}Input`)
  class UpdateOneInput implements UpdateOneInputType<DTO, U> {
    @IsNotEmpty()
    @Field(() => ID, { description: 'The id of the record to update' })
    id!: string | number;

    @Type(() => UpdateType)
    @ValidateNested()
    @Field(() => UpdateType, { description: 'The update to apply.' })
    update!: U;
  }
  metadataStorage.addUpdateOneInputType(DTOClass, UpdateOneInput);
  return UpdateOneInput;
}
