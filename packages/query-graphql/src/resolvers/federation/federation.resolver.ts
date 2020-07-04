import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../../metadata';
import { ReadRelationsResolver } from '../relations';
import { ServiceResolver } from '../resolver.interface';

export const FederationResolver = <DTO>(DTOClass: Class<DTO>): Class<ServiceResolver<DTO>> => {
  const relations = getMetadataStorage().getRelations(DTOClass);
  return ReadRelationsResolver(DTOClass, relations);
};
