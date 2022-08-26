import { ArrayReflector, Class, getPrototypeChain } from '@ptc-org/nestjs-query-core'

import { mergeBaseResolverOpts } from '../common'
import { RelationsOpts, ResolverRelation } from '../resolvers/relations'
import { ResolverManyRelation, ResolverOneRelation } from '../resolvers/relations/relations.interface'
import { PagingStrategies } from '../types/query/paging'
import { RELATION_KEY } from './constants'
import { BaseResolverOptions } from './resolver-method.decorator'

export const reflector = new ArrayReflector(RELATION_KEY)

export type RelationOneDecoratorOpts<Relation> = Omit<ResolverOneRelation<Relation>, 'DTO' | 'allowFiltering'>
export type RelationManyDecoratorOpts<Relation> = Omit<ResolverManyRelation<Relation>, 'DTO' | 'allowFiltering'>
export type RelationTypeFunc<Relation> = () => Class<Relation>
export type RelationClassDecorator<DTO> = <Cls extends Class<DTO>>(DTOClass: Cls) => Cls | void

interface RelationDescriptor<Relation> {
  name: string
  relationTypeFunc: RelationTypeFunc<Relation>
  isMany: boolean
  relationOpts?: Omit<ResolverRelation<Relation>, 'DTO'>
}

function getRelationsDescriptors<DTO>(DTOClass: Class<DTO>): RelationDescriptor<unknown>[] {
  return getPrototypeChain(DTOClass).reduce((relations, cls) => {
    const relationNames = relations.map((t) => t.name)
    const metaRelations = reflector.get<unknown, RelationDescriptor<unknown>>(cls) ?? []
    const inheritedRelations = metaRelations.filter((t) => !relationNames.includes(t.name))
    return [...inheritedRelations, ...relations]
  }, [] as RelationDescriptor<unknown>[])
}

function convertRelationsToOpts(relations: RelationDescriptor<unknown>[], baseOpts?: BaseResolverOptions): RelationsOpts {
  const relationOpts: RelationsOpts = {}
  relations.forEach((relation) => {
    const DTO = relation.relationTypeFunc()
    const opts = mergeBaseResolverOpts({ ...relation.relationOpts, DTO }, baseOpts ?? {})

    if (relation.isMany) {
      relationOpts.many = { ...relationOpts.many, [relation.name]: opts }
    } else {
      relationOpts.one = { ...relationOpts.one, [relation.name]: opts }
    }
  })
  return relationOpts
}

export function getRelations<DTO>(DTOClass: Class<DTO>, opts?: BaseResolverOptions): RelationsOpts {
  const relationDescriptors = getRelationsDescriptors(DTOClass)
  return convertRelationsToOpts(relationDescriptors, opts)
}

const relationDecorator = <IsMany>(isMany: boolean, allowFiltering: boolean, pagingStrategy?: PagingStrategies) => {
  return <DTO, Relation>(
      name: string,
      relationTypeFunc: RelationTypeFunc<Relation>,
      options?: IsMany extends true ? RelationManyDecoratorOpts<Relation> : RelationOneDecoratorOpts<Relation>
    ): RelationClassDecorator<DTO> =>
    <Cls extends Class<DTO>>(DTOClass: Cls): Cls | void => {
      reflector.append(DTOClass, {
        name,
        isMany,
        relationOpts: { pagingStrategy, allowFiltering, ...options },
        relationTypeFunc
      })
      return DTOClass
    }
}

export const Relation = relationDecorator<false>(false, false)
export const FilterableRelation = relationDecorator<false>(false, true)

export const UnPagedRelation = relationDecorator<true>(true, false, PagingStrategies.NONE)
export const FilterableUnPagedRelation = relationDecorator<true>(true, true, PagingStrategies.NONE)

export const OffsetConnection = relationDecorator<true>(true, false, PagingStrategies.OFFSET)
export const FilterableOffsetConnection = relationDecorator<true>(true, true, PagingStrategies.OFFSET)

export const CursorConnection = relationDecorator<true>(true, false, PagingStrategies.CURSOR)
export const FilterableCursorConnection = relationDecorator<true>(true, true, PagingStrategies.CURSOR)
