import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../metadata';
import { ResolverRelation } from '../resolvers/relations/relations.interface';

export type RelationDecoratorOpts<Relation> = Omit<ResolverRelation<Relation>, 'DTO'>;
export type RelationTypeFunc<Relation> = () => Class<Relation>;

export function Relation<DTO, Relation>(
  name: string,
  relationTypeFunction: RelationTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
) {
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    getMetadataStorage().addRelation(DTOClass, name, {
      name,
      isConnection: false,
      relationOpts: options,
      relationTypeFunc: relationTypeFunction,
    });
    return DTOClass;
  };
}

export function Connection<DTO, Relation>(
  name: string,
  relationTypeFunction: RelationTypeFunc<Relation>,
  options?: RelationDecoratorOpts<Relation>,
) {
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    getMetadataStorage().addRelation(DTOClass, name, {
      name,
      isConnection: true,
      relationOpts: options,
      relationTypeFunc: relationTypeFunction,
    });
    return DTOClass;
  };
}
