import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../metadata';
import { ResolverRelationReference } from '../resolvers/relations';
import { ReferencesKeys } from '../resolvers/relations/relations.interface';

export type ReferenceDecoratorOpts<DTO, Relation> = Omit<ResolverRelationReference<DTO, Relation>, 'DTO'>;
export type ReferenceTypeFunc<Relation> = () => Class<Relation>;

export function Reference<DTO, Reference>(
  name: string,
  relationTypeFunction: ReferenceTypeFunc<Reference>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keys: ReferencesKeys<any, Reference>,
  options?: ReferenceDecoratorOpts<DTO, Reference>,
) {
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    getMetadataStorage().addReference(DTOClass, name, {
      name,
      keys,
      relationOpts: options,
      relationTypeFunc: relationTypeFunction,
    });
    return DTOClass;
  };
}
