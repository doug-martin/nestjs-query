import { ArrayReflector, Class, getPrototypeChain } from '@nestjs-query/core';
import { RelationsOpts, ResolverRelation } from '../resolvers/relations';
import { PagingStrategies } from '../types/query/paging';
import { RELATION_KEY } from './constants';
import { BaseResolverOptions } from './resolver-method.decorator';
import { mergeBaseResolverOpts } from '../common';

export const reflector = new ArrayReflector(RELATION_KEY);

export type RelationDecoratorOpts<Relation> = Omit<ResolverRelation<Relation>, 'DTO'>;
export type RelationTypeFunc<Relation> = () => Class<Relation>;
export type RelationClassDecorator<DTO> = <Cls extends Class<DTO>>(DTOClass: Cls) => Cls | void;

interface RelationDescriptor<Relation> {
  name: string;
  relationTypeFunc: RelationTypeFunc<Relation>;
  isMany: boolean;
  relationOpts?: Omit<ResolverRelation<Relation>, 'DTO'>;
}

function getRelationsDescriptors<DTO>(DTOClass: Class<DTO>): RelationDescriptor<unknown>[] {
  return getPrototypeChain(DTOClass).reduce((relations, cls) => {
    const relationNames = relations.map((t) => t.name);
    const metaRelations = reflector.get<unknown, RelationDescriptor<unknown>>(cls) ?? [];
    const inheritedRelations = metaRelations.filter((t) => !relationNames.includes(t.name));
    return [...inheritedRelations, ...relations];
  }, [] as RelationDescriptor<unknown>[]);
}

function convertRelationsToOpts(
  relations: RelationDescriptor<unknown>[],
  baseOpts?: BaseResolverOptions,
): RelationsOpts {
  const relationOpts: RelationsOpts = {};
  relations.forEach((r) => {
    const DTO = r.relationTypeFunc();
    const opts = mergeBaseResolverOpts({ ...r.relationOpts, DTO }, baseOpts ?? {});
    if (r.isMany) {
      relationOpts.many = { ...relationOpts.many, [r.name]: opts };
    } else {
      relationOpts.one = { ...relationOpts.one, [r.name]: opts };
    }
  });
  return relationOpts;
}

export function getRelations<DTO>(DTOClass: Class<DTO>, opts?: BaseResolverOptions): RelationsOpts {
  const relationDescriptors = getRelationsDescriptors(DTOClass);
  return convertRelationsToOpts(relationDescriptors, opts);
}

const relationDecorator = (isMany: boolean, allowFiltering: boolean, pagingStrategy?: PagingStrategies) => <
  DTO,
  Relation
>(
  name: string,
  relationTypeFunc: RelationTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
): RelationClassDecorator<DTO> => <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
  reflector.append(DTOClass, {
    name,
    isMany,
    relationOpts: { pagingStrategy, allowFiltering, ...options },
    relationTypeFunc,
  });
  return DTOClass;
};

export const Relation = relationDecorator(false, false);
export const FilterableRelation = relationDecorator(false, true);

export const AllRelations = relationDecorator(true, false, PagingStrategies.NONE);
export const FilterableAllRelations = relationDecorator(true, true, PagingStrategies.NONE);

export const OffsetConnection = relationDecorator(true, false, PagingStrategies.OFFSET);
export const FilterableOffsetConnection = relationDecorator(true, true, PagingStrategies.OFFSET);

export const CursorConnection = relationDecorator(true, false, PagingStrategies.CURSOR);
export const FilterableCursorConnection = relationDecorator(true, true, PagingStrategies.CURSOR);
