import { Class } from '@nestjs-query/core';
import { RelationsOpts, ReadRelationsResolver } from '../relations';
import { getRelationsFromMetadata, mergeRelations } from '../relations/helpers';
import { ServiceResolver } from '../resolver.interface';

export const FederationResolver = <DTO>(
  DTOClass: Class<DTO>,
  relations: RelationsOpts = {},
): Class<ServiceResolver<DTO>> => {
  const metaRelations = getRelationsFromMetadata(DTOClass);
  const mergedRelations = mergeRelations(relations, metaRelations);
  return ReadRelationsResolver(DTOClass, mergedRelations);
};
