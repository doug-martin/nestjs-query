import { Pager } from '../../interfaces'
import { OffsetPagerResult } from './interfaces'
import { OffsetPager } from './pager'

export { OffsetPagerResult } from './interfaces'

// default pager factory to plug in addition paging strategies later on.
export const createPager = <DTO>(): Pager<DTO, OffsetPagerResult<DTO>> => new OffsetPager<DTO>()
