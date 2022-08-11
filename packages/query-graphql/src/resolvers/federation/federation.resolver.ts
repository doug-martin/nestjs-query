import { Class, QueryService } from '@ptc-org/nestjs-query-core'

import { getRelations } from '../../decorators'
import { BaseResolverOptions } from '../../decorators/resolver-method.decorator'
import { ReadRelationsResolver } from '../relations'
import { ServiceResolver } from '../resolver.interface'

export const FederationResolver = <DTO, QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>>(
  DTOClass: Class<DTO>,
  opts: BaseResolverOptions = {}
): Class<ServiceResolver<DTO, QS>> => ReadRelationsResolver(DTOClass, getRelations(DTOClass, opts))
