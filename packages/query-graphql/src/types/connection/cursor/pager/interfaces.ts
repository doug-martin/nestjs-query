import { Query } from '@ptc-org/nestjs-query-core'

import { CursorConnectionType, PagerResult } from '../../interfaces'
import { CursorPagingOpts } from './strategies'

export interface PagingMeta<DTO, Opts extends CursorPagingOpts<DTO>> {
  opts: Opts
  query: Query<DTO>
}

export interface QueryResults<DTO> {
  nodes: DTO[]
  hasExtraNode: boolean
}

export type CursorPagerResult<DTO> = PagerResult & Omit<CursorConnectionType<DTO>, 'totalCount'>
