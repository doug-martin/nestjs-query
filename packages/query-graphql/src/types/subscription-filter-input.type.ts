import { Filter, Class } from '@nestjs-query/core';
import { Field, InputType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionFilterType } from './query';

export interface SubscriptionFilterInputType<DTO> {
  filter?: Filter<DTO>;
}

/**
 * Input abstract type for all subscription filters.
 * @param DTOClass - The DTO used to create a FilterType for the filter.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function SubscriptionFilterInputType<DTO>(DTOClass: Class<DTO>): Class<SubscriptionFilterInputType<DTO>> {
  const F = SubscriptionFilterType(DTOClass);

  @InputType({ isAbstract: true })
  class SubscriptionFilterInput implements SubscriptionFilterInputType<DTO> {
    @Field(() => F, {
      description: 'Specify to filter the records returned.',
    })
    @ValidateNested()
    @Type(() => F)
    filter?: Filter<DTO>;
  }
  return SubscriptionFilterInput;
}
