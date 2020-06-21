import { Class } from '@nestjs-query/core';
import { PagingStrategies } from '../../types/query/paging';
import { ServiceResolver } from '../resolver.interface';
import { getReferencesFromMetadata, getRelationsFromMetadata, mergeReferences, mergeRelations } from './helpers';
import { ReadRelationsMixin } from './read-relations.resolver';
import { ReferencesRelationMixin } from './references-relation.resolver';
import { ReferencesOpts, RelationsOpts } from './relations.interface';
import { RemoveRelationsMixin } from './remove-relations.resolver';
import { UpdateRelationsMixin } from './update-relations.resolver';

export interface RelatableOpts<DTO> {
  pagingStrategy?: PagingStrategies;
  enableTotalCount?: boolean;
  relations: RelationsOpts;
  references: ReferencesOpts<DTO>;
}

export const Relatable = <DTO>(DTOClass: Class<DTO>, opts: RelatableOpts<DTO>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  const { pagingStrategy, enableTotalCount, references, relations } = opts;
  const metaRelations = getRelationsFromMetadata(DTOClass);
  const mergedRelations = mergeRelations(relations, metaRelations);

  const metaReferences = getReferencesFromMetadata(DTOClass);
  const mergedReferences = mergeReferences(references, metaReferences);

  const referencesMixin = ReferencesRelationMixin(DTOClass, mergedReferences);
  const readRelationsMixin = ReadRelationsMixin(DTOClass, { ...mergedRelations, enableTotalCount, pagingStrategy });
  const updateRelationsMixin = UpdateRelationsMixin(DTOClass, mergedRelations);

  return referencesMixin(
    readRelationsMixin(updateRelationsMixin(RemoveRelationsMixin(DTOClass, mergedRelations)(Base))),
  );
};
