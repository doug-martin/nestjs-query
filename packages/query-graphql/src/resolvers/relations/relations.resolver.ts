import { Class } from '@nestjs-query/core';
import { ServiceResolver } from '../resolver.interface';
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
  return ReferencesRelationMixin(
    DTOClass,
    referencesOpts,
  )(
    ReadRelationsMixin(
      DTOClass,
      relations,
    )(UpdateRelationsMixin(DTOClass, relations)(RemoveRelationsMixin(DTOClass, relations)(Base))),
  );
};
