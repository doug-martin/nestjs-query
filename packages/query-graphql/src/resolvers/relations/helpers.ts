import omit from 'lodash.omit';
import { ResolverMethodOpts } from '../../decorators';
import { RelationMap, ResolverRelation } from '../resolver.interface';

export const flattenRelations = (relationOptions: RelationMap): ResolverRelation<unknown>[] => {
  return Object.keys(relationOptions).map(name => ({ dtoName: name, ...relationOptions[name] }));
};

export const removeRelationOpts = <Relation>(opts: ResolverRelation<Relation>): ResolverMethodOpts => {
  return omit(opts, 'DTO', 'nullable', 'dtoName', 'relationName', 'disableRead', 'disableUpdate', 'disableRemove');
};
