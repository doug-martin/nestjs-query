import { Class } from '@nestjs-query/core';
import { ServiceResolver } from '../resolver.interface';
import { getReferencesFromMetadata, getRelationsFromMetadata, mergeReferences, mergeRelations } from './helpers';
import { ReadRelationsMixin } from './read-relations.resolver';
import { ReferencesRelationMixin } from './references-relation.resolver';
import { ReferencesOpts, RelationsOpts } from './relations.interface';
import { RemoveRelationsMixin } from './remove-relations.resolver';
import { UpdateRelationsMixin } from './update-relations.resolver';

export const Relatable = <DTO>(DTOClass: Class<DTO>, relations: RelationsOpts, referencesOpts: ReferencesOpts<DTO>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  const metaRelations = getRelationsFromMetadata(DTOClass);
  const mergedRelations = mergeRelations(relations, metaRelations);

  const metaReferences = getReferencesFromMetadata(DTOClass);
  const mergedReferences = mergeReferences(referencesOpts, metaReferences);

  const references = ReferencesRelationMixin(DTOClass, mergedReferences);
  const readRelations = ReadRelationsMixin(DTOClass, mergedRelations);
  const updateRelations = UpdateRelationsMixin(DTOClass, mergedRelations);

  return references(readRelations(updateRelations(RemoveRelationsMixin(DTOClass, mergedRelations)(Base))));
};
