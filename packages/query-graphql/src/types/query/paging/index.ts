import { CursorPagingType, StaticCursorPagingType } from './cursor-paging.type';
import { OffsetPagingType, StaticOffsetPagingType } from './offset-paging.type';

export { StaticCursorPagingType, CursorPagingType } from './cursor-paging.type';
export { StaticOffsetPagingType, OffsetPagingType } from './offset-paging.type';
export { PagingStrategies } from './constants';

export type StaticPagingTypes = StaticOffsetPagingType | StaticCursorPagingType | never;
export type PagingTypes = OffsetPagingType | CursorPagingType | never;
