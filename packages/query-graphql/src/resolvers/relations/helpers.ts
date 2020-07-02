import { Class } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { ResolverMethodOpts } from '../../decorators';
import { getMetadataStorage } from '../../metadata';
import {
  ReferencesOpts,
  RelationsOpts,
  RelationTypeMap,
  ResolverRelation,
  ResolverRelationReference,
} from './relations.interface';

export const flattenRelations = <RT extends ResolverRelation<unknown> | ResolverRelationReference<unknown, unknown>>(
  relationOptions: RelationTypeMap<RT>,
): RT[] => {
  return Object.keys(relationOptions).map((name) => ({ dtoName: name, ...relationOptions[name] }));
};

export const removeRelationOpts = <Relation>(
  opts: ResolverRelation<Relation> | ResolverRelationReference<unknown, Relation>,
): ResolverMethodOpts => {
  return omit(
    opts,
    'DTO',
    'keys',
    'nullable',
    'dtoName',
    'relationName',
    'disableRead',
    'disableUpdate',
    'disableRemove',
  );
};

export const getRelationsFromMetadata = <DTO>(DTOClass: Class<DTO>): RelationsOpts => {
  return getMetadataStorage().getRelations(DTOClass);
};

export const mergeRelations = (into: RelationsOpts, from: RelationsOpts): RelationsOpts => {
  const oneRelations = { ...into.one, ...(from.one ?? {}) };
  const manyRelations = { ...into.many, ...(from.many ?? {}) };
  return { one: oneRelations, many: manyRelations };
};

export const getReferencesFromMetadata = <DTO>(DTOClass: Class<DTO>): ReferencesOpts<DTO> => {
  const metaReferences = getMetadataStorage().getReferences(DTOClass) ?? [];
  return metaReferences.reduce((references, r) => {
    const opts = { ...r.relationOpts, DTO: r.relationTypeFunc(), keys: r.keys };
    return { ...references, [r.name]: opts };
  }, {} as ReferencesOpts<DTO>);
};

export const mergeReferences = <DTO>(into: ReferencesOpts<DTO>, from: ReferencesOpts<DTO>): ReferencesOpts<DTO> => {
  return { ...into, ...from };
};
