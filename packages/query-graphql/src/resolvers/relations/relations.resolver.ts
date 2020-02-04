import { Class } from '@nestjs-query/core';
import { RelationsOpts, ServiceResolver } from '../resolver.interface';
import { ReadRelationsMixin } from './read-relations.resolver';
import { RemoveRelationsMixin } from './remove-relations.resolver';
import { UpdateRelationsMixin } from './update-relations.resolver';

export const Relatable = <DTO>(DTOClass: Class<DTO>, relations: RelationsOpts) => <
  B extends Class<ServiceResolver<DTO>>
>(
  Base: B,
): B => {
  return ReadRelationsMixin(
    DTOClass,
    relations,
  )(UpdateRelationsMixin(DTOClass, relations)(RemoveRelationsMixin(DTOClass, relations)(Base)));
};
