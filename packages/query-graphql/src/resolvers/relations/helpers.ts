import omit from 'lodash.omit'

import { ResolverMethodOpts } from '../../decorators'
import { RelationTypeMap, ResolverRelation, ResolverRelationReference } from './relations.interface'

export const flattenRelations = <RT extends ResolverRelation<unknown> | ResolverRelationReference<unknown, unknown>>(
  relationOptions: RelationTypeMap<RT>
): RT[] => Object.keys(relationOptions).map((name) => ({ dtoName: name, ...relationOptions[name] }))

export const removeRelationOpts = <Relation>(
  opts: ResolverRelation<Relation> | ResolverRelationReference<unknown, Relation>
): ResolverMethodOpts =>
  omit(opts, 'DTO', 'keys', 'nullable', 'dtoName', 'relationName', 'disableRead', 'disableUpdate', 'disableRemove', 'description')
