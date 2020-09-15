import { Class } from '@nestjs-query/core';
import { ReadRelationsResolver } from '../relations';
import { ServiceResolver } from '../resolver.interface';
import { getRelations } from '../../decorators';
import { BaseResolverOptions } from '../../decorators/resolver-method.decorator';

export const FederationResolver = <DTO>(
  DTOClass: Class<DTO>,
  opts: BaseResolverOptions = {},
): Class<ServiceResolver<DTO, unknown, unknown>> => {
  return ReadRelationsResolver(DTOClass, getRelations(DTOClass, opts));
};
