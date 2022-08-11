import { Paging, Query } from '@ptc-org/nestjs-query-core'

import { OffsetConnectionType, PagerResult } from '../../interfaces'

export type OffsetPagingOpts = Required<Paging>

export interface OffsetPagingMeta<DTO> {
  opts: OffsetPagingOpts
  query: Query<DTO>
}

export interface QueryResults<DTO> {
  nodes: DTO[]
  hasExtraNode: boolean
}

export type OffsetPagerResult<DTO> = PagerResult & Omit<OffsetConnectionType<DTO>, 'totalCount'>
