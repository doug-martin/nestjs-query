import { Paging } from '@nestjs-query/core';
import { PagingStrategies } from './constants';
import { ConnectionCursorType } from '../../cursor.scalar';

export interface CursorPagingType extends Paging {
  before?: ConnectionCursorType;
  after?: ConnectionCursorType;
  first?: number;
  last?: number;
}
export type NonePagingType = Paging;
export type OffsetPagingType = Paging;

export type PagingTypes = OffsetPagingType | CursorPagingType | NonePagingType;
export type InferPagingTypeFromStrategy<PS extends PagingStrategies> = PS extends PagingStrategies.CURSOR
  ? CursorPagingType
  : PS extends PagingStrategies.OFFSET
  ? OffsetPagingType
  : PS extends PagingStrategies.NONE
  ? NonePagingType
  : never;
