import { applyFilter, Class, Filter } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { PagingStrategies, StaticQueryArgsType, SubscriptionArgsType, SubscriptionFilterInputType } from '../types';
import { Authorizer } from '../auth';
import { ConnectionOptions } from '../types/connection';

/** @internal */
export const transformAndValidate = async <T>(TClass: Class<T>, partial: T): Promise<T> => {
  if (partial instanceof TClass) {
    return partial;
  }
  const transformed = plainToClass(TClass, partial);
  const validationErrors = await validate((transformed as unknown) as Record<keyof never, unknown>);
  if (validationErrors.length) {
    throw new BadRequestException(validationErrors);
  }
  return transformed;
};

export const createSubscriptionFilter = <DTO, Input extends SubscriptionFilterInputType<DTO>>(
  InputClass: Class<Input>,
  payloadKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ((payload: any, variables: SubscriptionArgsType<Input>, context: any) => boolean | Promise<boolean>) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (payload: any, variables: SubscriptionArgsType<Input>): Promise<boolean> => {
    const { input } = variables;
    if (input) {
      const args = await transformAndValidate(InputClass, input);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const dto = payload[payloadKey] as DTO;
      return applyFilter(dto, args.filter || {});
    }
    return true;
  };

export const getAuthFilter = async <DTO>(
  authorizer?: Authorizer<DTO>,
  context?: unknown,
): Promise<Filter<DTO> | undefined> => {
  if (!context || !authorizer) {
    return undefined;
  }
  return authorizer.authorize(context);
};

export const getRelationAuthFilter = async <DTO, Relation>(
  relationName: string,
  authorizer?: Authorizer<DTO>,
  context?: unknown,
): Promise<Filter<Relation> | undefined> => {
  if (!context || !authorizer) {
    return undefined;
  }
  return authorizer.authorizeRelation(relationName, context);
};

export const extractConnectionOptsFromQueryArgs = <DTO>(
  args: StaticQueryArgsType<DTO>,
  rest: ConnectionOptions,
): ConnectionOptions => ({
  ...rest,
  pagingStrategy: args.PageType?.strategy ?? PagingStrategies.NONE,
});
