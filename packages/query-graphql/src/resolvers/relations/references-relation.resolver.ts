import { Class, QueryService } from '@nestjs-query/core';
import { Parent, Resolver } from '@nestjs/graphql';
import { getDTONames } from '../../common';
import { ResolverField } from '../../decorators';
import { RepresentationType } from '../../federation';
import { ServiceResolver, BaseServiceResolver } from '../resolver.interface';
import { flattenRelations, removeRelationOpts } from './helpers';
import { ReferencesKeys, ReferencesOpts, ResolverRelationReference } from './relations.interface';

const pluckFields = <DTO, Relation>(dto: DTO, fieldMap: ReferencesKeys<DTO, Relation>): Partial<Relation> => {
  const partial: Record<string, unknown> = {};
  Object.keys(fieldMap).forEach((relationField) => {
    const dtoField = fieldMap[relationField as keyof Relation];
    partial[relationField] = dto[dtoField as keyof DTO];
  });
  return partial as Partial<Relation>;
};

const allFieldsAreNull = <Relation>(fields: Partial<Relation>): boolean => {
  return Object.values(fields).reduce<boolean>(
    (previousNull, value) => previousNull && (value === null || value === undefined),
    true,
  );
};

const ReferencesMixin =
  <DTO, Relation>(DTOClass: Class<DTO>, reference: ResolverRelationReference<DTO, Relation>) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    const commonResolverOpts = removeRelationOpts(reference);
    const relationDTO = reference.DTO;
    const { baseNameLower, baseName } = getDTONames(relationDTO, { dtoName: reference.dtoName });

    @Resolver(() => DTOClass, { isAbstract: true })
    class ReadOneMixin extends Base {
      @ResolverField(
        baseNameLower,
        () => relationDTO,
        { nullable: reference.nullable, complexity: reference.complexity },
        commonResolverOpts,
      )
      [`${baseNameLower}Reference`](@Parent() dto: DTO): RepresentationType | null {
        const fields = pluckFields<DTO, Relation>(dto, reference.keys);

        if (allFieldsAreNull(fields)) {
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        return { __typename: baseName, ...fields };
      }
    }
    return ReadOneMixin;
  };

export const ReferencesRelationMixin =
  <DTO>(DTOClass: Class<DTO>, references: ReferencesOpts<DTO>) =>
  <B extends Class<ServiceResolver<DTO, QueryService<DTO, unknown, unknown>>>>(Base: B): B => {
    const flattened = flattenRelations(references);
    return flattened.reduce((RB, a) => ReferencesMixin(DTOClass, a)(RB), Base);
  };

export const ReferencesRelationsResolver = <
  DTO,
  QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>,
>(
  DTOClass: Class<DTO>,
  references: ReferencesOpts<DTO>,
): Class<ServiceResolver<DTO, QS>> => ReferencesRelationMixin(DTOClass, references)(BaseServiceResolver);
