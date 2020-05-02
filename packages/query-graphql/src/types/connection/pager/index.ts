import { Pager } from './interfaces';
import { LimitOffsetPager } from './limit-offset.pager';

export { Pager, PagingResults, QueryMany } from './interfaces';

// default pager factory to plug in addition paging strategies later on.
export const createPager = <DTO>(): Pager<DTO> => new LimitOffsetPager<DTO>();
