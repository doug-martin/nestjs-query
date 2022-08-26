import { Class } from '@ptc-org/nestjs-query-core'

import { PagingStrategies } from './constants'
import { NonePagingType } from './interfaces'

let graphQLPaging: Class<NonePagingType> | null = null
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const getOrCreateNonePagingType = (): Class<NonePagingType> => {
  if (graphQLPaging) {
    return graphQLPaging
  }

  class GraphQLPagingImpl implements NonePagingType {
    static strategy: PagingStrategies.NONE = PagingStrategies.NONE
  }

  graphQLPaging = GraphQLPagingImpl
  return graphQLPaging
}
