import { ArrayReflector, Class, getPrototypeChain } from '@nestjs-query/core';
import { ReferencesOpts, ResolverRelationReference } from '../resolvers/relations';
import { ReferencesKeys } from '../resolvers/relations/relations.interface';
import { REFERENCE_KEY } from './constants';
import { BaseResolverOptions } from './resolver-method.decorator';
import { mergeBaseResolverOpts } from '../common';

const reflector = new ArrayReflector(REFERENCE_KEY);
export type ReferenceDecoratorOpts<DTO, Relation> = Omit<ResolverRelationReference<DTO, Relation>, 'DTO' | 'keys'>;
export type ReferenceTypeFunc<Relation> = () => Class<Relation>;

interface ReferenceDescriptor<DTO, Reference> {
  name: string;
  keys: ReferencesKeys<DTO, Reference>;
  relationTypeFunc: () => Class<Reference>;
  relationOpts?: Omit<ResolverRelationReference<DTO, Reference>, 'DTO' | 'keys'>;
}

function getReferenceDescriptors<DTO>(DTOClass: Class<DTO>): ReferenceDescriptor<DTO, unknown>[] {
  return getPrototypeChain(DTOClass).reduce((references, cls) => {
    const referenceNames = references.map((r) => r.name);
    const metaReferences = reflector.get<DTO, ReferenceDescriptor<DTO, unknown>>(cls as Class<DTO>) ?? [];
    const inheritedReferences = metaReferences.filter((t) => !referenceNames.includes(t.name));
    return [...inheritedReferences, ...references];
  }, [] as ReferenceDescriptor<DTO, unknown>[]);
}

function convertReferencesToOpts<DTO>(
  references: ReferenceDescriptor<DTO, unknown>[],
  baseOpts?: BaseResolverOptions,
): ReferencesOpts<DTO> {
  return references.reduce((referenceOpts, r) => {
    const opts = mergeBaseResolverOpts<ResolverRelationReference<DTO, unknown>>(
      { ...r.relationOpts, DTO: r.relationTypeFunc(), keys: r.keys },
      baseOpts ?? {},
    );
    return { ...referenceOpts, [r.name]: opts };
  }, {} as ReferencesOpts<DTO>);
}

export function getReferences<DTO>(DTOClass: Class<DTO>, opts?: BaseResolverOptions): ReferencesOpts<DTO> {
  const referenceDescriptors = getReferenceDescriptors(DTOClass);
  return convertReferencesToOpts(referenceDescriptors, opts);
}

export function Reference<DTO, Reference>(
  name: string,
  relationTypeFunc: ReferenceTypeFunc<Reference>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keys: ReferencesKeys<any, Reference>,
  relationOpts?: ReferenceDecoratorOpts<DTO, Reference>,
) {
  return <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
    reflector.append(DTOClass, { name, keys, relationOpts, relationTypeFunc });
    return DTOClass;
  };
}
