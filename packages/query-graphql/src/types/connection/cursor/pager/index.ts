import { Class } from '@nestjs-query/core';
import { getKeySet } from '../../../../decorators';
import { Pager } from '../../interfaces';
import { CursorPagerResult } from './interfaces';
import { CursorPager } from './pager';
import { KeysetPagerStrategy, LimitOffsetPagerStrategy } from './strategies';

export type PagerOpts = {
  disableKeySetPagination?: boolean;
};

// default pager factory to plug in addition paging strategies later on.
export const createPager = <DTO>(DTOClass: Class<DTO>, opts: PagerOpts): Pager<DTO, CursorPagerResult<DTO>> => {
  const keySet = opts.disableKeySetPagination ? undefined : getKeySet(DTOClass);
  if (keySet && keySet.length) {
    return new CursorPager<DTO>(new KeysetPagerStrategy(DTOClass, keySet));
  }
  return new CursorPager<DTO>(new LimitOffsetPagerStrategy());
};
