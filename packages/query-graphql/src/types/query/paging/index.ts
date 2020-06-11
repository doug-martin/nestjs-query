import { CursorPagingType, StaticCursorPagingType } from './cursor-paging.type';
import { LimitOffsetPagingType, StaticLimitOffsetPagingType } from './limit-offset-paging.type';

export { StaticCursorPagingType, CursorPagingType } from './cursor-paging.type';
export { StaticLimitOffsetPagingType, LimitOffsetPagingType } from './limit-offset-paging.type';
export { PagingStrategies } from './constants';

export type StaticPagingTypes = StaticLimitOffsetPagingType | StaticCursorPagingType;
export type PagingTypes = LimitOffsetPagingType | CursorPagingType;
