import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../../metadata';
import { ServiceResolver } from '../resolver.interface';
import { ReadRelationsMixin } from './read-relations.resolver';
import { ReferencesRelationMixin } from './references-relation.resolver';
import { ReferencesOpts, RelationsOpts } from './relations.interface';
import { RemoveRelationsMixin } from './remove-relations.resolver';
import { UpdateRelationsMixin } from './update-relations.resolver';

const getRelationsFromMetadata = <DTO>(DTOClass: Class<DTO>): RelationsOpts => {
  const relations: RelationsOpts = {};
  const metaRelations = getMetadataStorage().getRelations(DTOClass) ?? [];
  metaRelations.forEach((r) => {
    const opts = { ...r.relationOpts, DTO: r.relationTypeFunc() };
    if (r.isConnection) {
      relations.many = { ...relations.many, [r.name]: opts };
    } else {
      relations.one = { ...relations.one, [r.name]: opts };
    }
  });
  return relations;
};

export const Relatable = <DTO>(DTOClass: Class<DTO>, relations: RelationsOpts, referencesOpts: ReferencesOpts<DTO>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  const metaRelations = getRelationsFromMetadata(DTOClass);
  const oneRelations = { ...relations.one, ...(metaRelations.one ?? {}) };
  const manyRelations = { ...relations.many, ...(metaRelations.many ?? {}) };
  const mergedRelations = { one: oneRelations, many: manyRelations };
  return ReferencesRelationMixin(
    DTOClass,
    referencesOpts,
  )(
    ReadRelationsMixin(
      DTOClass,
      mergedRelations,
    )(UpdateRelationsMixin(DTOClass, mergedRelations)(RemoveRelationsMixin(DTOClass, mergedRelations)(Base))),
  );
};
