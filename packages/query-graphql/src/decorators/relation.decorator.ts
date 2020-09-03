import { ArrayReflector, Class, getPrototypeChain } from '@nestjs-query/core';
import { RelationsOpts, ResolverRelation } from '../resolvers/relations';
import { PagingStrategies } from '../types/query/paging';
import { RELATION_KEY } from './constants';
import { BaseResolverOptions } from './resolver-method.decorator';
import { mergeBaseResolverOpts } from '../common';

export const reflector = new ArrayReflector(RELATION_KEY);

export type RelationDecoratorOpts<Relation> = Omit<ResolverRelation<Relation>, 'DTO'>;
export type RelationTypeFunc<Relation> = () => Class<Relation> | Class<Relation>[];
export type ConnectionTypeFunc<Relation> = () => Class<Relation>;
export type RelationClassDecorator<DTO> = <Cls extends Class<DTO>>(DTOClass: Cls) => Cls | void;

interface RelationDescriptor<Relation> {
  name: string;
  relationTypeFunc: () => Class<Relation> | Class<Relation>[];
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
    const relationType = r.relationTypeFunc();
    const DTO = Array.isArray(relationType) ? relationType[0] : relationType;
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

export function Relation<DTO, Relation>(
  name: string,
  relationTypeFunc: RelationTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
): RelationClassDecorator<DTO> {
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    const isMany = Array.isArray(relationTypeFunc());
    const relationOpts = isMany ? { pagingStrategy: PagingStrategies.OFFSET, ...options } : options;
    reflector.append(DTOClass, { name, isMany, relationOpts, relationTypeFunc });
    return DTOClass;
  };
}

export function FilterableRelation<DTO, Relation>(
  name: string,
  relationTypeFunc: RelationTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
): RelationClassDecorator<DTO> {
  return Relation<DTO, Relation>(name, relationTypeFunc, { ...options, allowFiltering: true });
}

export function Connection<DTO, Relation>(
  name: string,
  relationTypeFunc: ConnectionTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
): RelationClassDecorator<DTO> {
  const relationOpts = { pagingStrategy: PagingStrategies.CURSOR, ...options };
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    reflector.append(DTOClass, { name, isMany: true, relationOpts, relationTypeFunc });
    return DTOClass;
  };
}

export function FilterableConnection<DTO, Relation>(
  name: string,
  relationTypeFunc: ConnectionTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
): RelationClassDecorator<DTO> {
  return Connection<DTO, Relation>(name, relationTypeFunc, { ...options, allowFiltering: true });
}
