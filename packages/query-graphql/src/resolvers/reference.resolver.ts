import { Class, QueryService } from '@nestjs-query/core';
import { Resolver, ResolveReference } from '@nestjs/graphql';
import { BadRequestException } from '@nestjs/common';
import { getDTONames } from '../common';
import { RepresentationType } from '../federation';
import { BaseServiceResolver, ResolverClass, ServiceResolver } from './resolver.interface';

export interface ReferenceResolverOpts {
  key?: string;
}

/**
 * @internal
 * Mixin to expose `resolveReference` for a DTO on the resolver.
 */
export const Referenceable =
  <DTO, QS extends QueryService<DTO, unknown, unknown>>(DTOClass: Class<DTO>, opts: ReferenceResolverOpts) =>
  <B extends Class<ServiceResolver<DTO, QS>>>(BaseClass: B): B => {
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

export const ReferenceResolver = <
  DTO,
  QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>,
>(
  DTOClass: Class<DTO>,
  opts: ReferenceResolverOpts = {},
): ResolverClass<DTO, QS, ServiceResolver<DTO, QS>> => Referenceable<DTO, QS>(DTOClass, opts)(BaseServiceResolver);
