import { Class } from '@nestjs-query/core';
import { Resolver, ResolveReference } from '@nestjs/graphql';
import { BadRequestException } from '@nestjs/common';
import { getDTONames } from '../common';
import { RepresentationType } from '../federation';
import { BaseServiceResolver, ResolverClass, ServiceResolver } from './resolver.interface';

export interface ReferenceResolverOpts<DTO> {
  key?: string;
}

/**
 * @internal
 * Mixin to expose `resolveReference` for a DTO on the resolver.
 */
export const Refereceable = <DTO>(DTOClass: Class<DTO>, opts: ReferenceResolverOpts<DTO>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): B => {
  if (!('key' in opts) || opts.key === undefined) {
    return BaseClass;
  }
  const { key } = opts;
  @Resolver(() => DTOClass, { isAbstract: true })
  class ResolveReferenceResolverBase extends BaseClass {
    @ResolveReference()
    async resolveReference(representation: RepresentationType): Promise<DTO> {
      const id = representation[key];
      if (id === undefined) {
        throw new BadRequestException(
          `Unable to resolve reference, missing required key ${key} for ${getDTONames(DTOClass).baseName}`,
        );
      }
      return this.service.getById(representation[key] as string | number);
    }
  }
  return ResolveReferenceResolverBase;
};

export const ReferenceResolver = <DTO>(
  DTOClass: Class<DTO>,
  opts: ReferenceResolverOpts<DTO> = {},
): ResolverClass<DTO, ServiceResolver<DTO>> => Refereceable(DTOClass, opts)(BaseServiceResolver);
