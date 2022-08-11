import { Paging } from '@ptc-org/nestjs-query-core'

import { ConnectionCursorType } from '../../cursor.scalar'
import { PagingStrategies } from './constants'

export interface CursorPagingType extends Paging {
  before?: ConnectionCursorType
  after?: ConnectionCursorType
  first?: number
  last?: number
}

export type NonePagingType = Paging
export type OffsetPagingType = Paging

export type PagingTypes = OffsetPagingType | CursorPagingType | NonePagingType
export type InferPagingTypeFromStrategy<PS extends PagingStrategies> = PS extends PagingStrategies.CURSOR
  ? CursorPagingType
  : PS extends PagingStrategies.OFFSET
  ? OffsetPagingType
  : PS extends PagingStrategies.NONE
  ? NonePagingType
  : never
