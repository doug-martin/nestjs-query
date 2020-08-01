import { Class } from '@nestjs-query/core';
import { ReadRelationsResolver } from '../relations';
import { ServiceResolver } from '../resolver.interface';
import { getRelations } from '../../decorators';

export const FederationResolver = <DTO>(DTOClass: Class<DTO>): Class<ServiceResolver<DTO>> => {
  return ReadRelationsResolver(DTOClass, getRelations(DTOClass));
};
