import { Filter, Class } from '@nestjs-query/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateFilterType } from './query';

export interface UpdateManyInputType<DTO, U> {
  filter: Filter<DTO>;
  update: U;
}

/**
 * Input abstract type for all update many endpoints.
 * @param DTOClass - The DTO used to create a FilterType for the update.
 * @param UpdateType - The InputType to use for the update field.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function UpdateManyInputType<DTO, U>(
  DTOClass: Class<DTO>,
  UpdateType: Class<U>,
): Class<UpdateManyInputType<DTO, U>> {
  const F = UpdateFilterType(DTOClass);

  @InputType({ isAbstract: true })
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
  return UpdateManyInput;
}
