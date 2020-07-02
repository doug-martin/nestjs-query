import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../metadata';
import { ResolverRelation } from '../resolvers/relations';
import { PagingStrategies } from '../types/query/paging';

export type RelationDecoratorOpts<Relation> = Omit<ResolverRelation<Relation>, 'DTO'>;
export type RelationTypeFunc<Relation> = () => Class<Relation> | Class<Relation>[];
export type ConnectionTypeFunc<Relation> = () => Class<Relation>;

export function Relation<DTO, Relation>(
  name: string,
  relationTypeFunction: RelationTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
) {
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    const isMany = Array.isArray(relationTypeFunction());
    getMetadataStorage().addRelation(DTOClass, name, {
      name,
      isMany,
      relationOpts: isMany ? { pagingStrategy: PagingStrategies.OFFSET, ...options } : options,
      relationTypeFunc: relationTypeFunction,
    });
    return DTOClass;
  };
}

export function FilterableRelation<DTO, Relation>(
  name: string,
  relationTypeFunction: RelationTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
) {
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    const isMany = Array.isArray(relationTypeFunction());
    const relationOpts = {
      ...(isMany ? { pagingStrategy: PagingStrategies.OFFSET, ...options } : options),
      allowFiltering: true,
    };
    getMetadataStorage().addRelation(DTOClass, name, {
      name,
      isMany,
      relationOpts,
      relationTypeFunc: relationTypeFunction,
    });
    return DTOClass;
  };
}

export function Connection<DTO, Relation>(
  name: string,
  relationTypeFunction: ConnectionTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
) {
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    getMetadataStorage().addRelation(DTOClass, name, {
      name,
      isMany: true,
      relationOpts: { pagingStrategy: PagingStrategies.CURSOR, ...options },
      relationTypeFunc: relationTypeFunction,
    });
    return DTOClass;
  };
}

export function FilterableConnection<DTO, Relation>(
  name: string,
  relationTypeFunction: ConnectionTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
) {
  const relationOpts = { pagingStrategy: PagingStrategies.CURSOR, ...options, allowFiltering: true };
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    getMetadataStorage().addRelation(DTOClass, name, {
      name,
      isMany: true,
      relationOpts,
      relationTypeFunc: relationTypeFunction,
    });
    return DTOClass;
  };
}
