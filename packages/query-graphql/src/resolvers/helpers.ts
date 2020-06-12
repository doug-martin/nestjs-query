import { Class } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import {
  QueryArgsType,
  QueryArgsTypeOpts,
  StaticCursorQueryArgsType,
  StaticOffsetQueryArgsType,
  StaticQueryArgsType,
} from '../types/query/query-args.type';
import { PagingStrategies, StaticPagingTypes } from '../types';

/** @internal */
export const transformAndValidate = async <T>(TClass: Class<T>, partial: T): Promise<T> => {
  if (partial instanceof TClass) {
    return partial;
  }
  const transformed = plainToClass(TClass, partial);
  const validationErrors = await validate(transformed, {});
  if (validationErrors.length) {
    throw new BadRequestException(validationErrors);
  }
  return transformed;
};

type QueryArgsTypes<DTO> = {
  CursorQueryType: StaticCursorQueryArgsType<DTO>;
  OffsetQueryType: StaticOffsetQueryArgsType<DTO>;
};
export const createAllQueryArgsType = <DTO>(
  DTOClass: Class<DTO>,
  opts: QueryArgsTypeOpts<DTO>,
  QA?: StaticQueryArgsType<DTO, StaticPagingTypes>,
): QueryArgsTypes<DTO> => {
  const CursorQueryType =
    QA && QA.PageType.strategy === PagingStrategies.CURSOR
      ? (QA as StaticCursorQueryArgsType<DTO>)
      : QueryArgsType(DTOClass, { ...opts, pagingStrategy: PagingStrategies.CURSOR });
  const OffsetQueryType =
    QA && QA.PageType.strategy === PagingStrategies.OFFSET
      ? (QA as StaticOffsetQueryArgsType<DTO>)
      : QueryArgsType(DTOClass, { ...opts, pagingStrategy: PagingStrategies.OFFSET });
  return { CursorQueryType, OffsetQueryType };
};
