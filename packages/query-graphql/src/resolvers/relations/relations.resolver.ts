import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../../metadata';
import { ServiceResolver } from '../resolver.interface';
import { ReadRelationsMixin } from './read-relations.resolver';
import { ReferencesRelationMixin } from './references-relation.resolver';
import { RemoveRelationsMixin } from './remove-relations.resolver';
import { UpdateRelationsMixin } from './update-relations.resolver';

export interface RelatableOpts<DTO> {
  enableTotalCount?: boolean;
}

export const Relatable = <DTO>(DTOClass: Class<DTO>, opts: RelatableOpts<DTO>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  const metadataStorage = getMetadataStorage();
  const { enableTotalCount } = opts;
  const relations = metadataStorage.getRelations(DTOClass);
  const references = metadataStorage.getReferences(DTOClass);

  const referencesMixin = ReferencesRelationMixin(DTOClass, references);
  const readRelationsMixin = ReadRelationsMixin(DTOClass, { ...relations, enableTotalCount });
  const updateRelationsMixin = UpdateRelationsMixin(DTOClass, relations);

  return referencesMixin(readRelationsMixin(updateRelationsMixin(RemoveRelationsMixin(DTOClass, relations)(Base))));
};
