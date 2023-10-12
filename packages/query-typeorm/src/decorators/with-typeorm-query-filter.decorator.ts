import { ArrayReflector, Class } from '@nestjs-query/core';
import { CustomFilter } from '../query';
import { WITH_TYPEORM_QUERY_FILTER_KEY } from './constants';

const reflector = new ArrayReflector(WITH_TYPEORM_QUERY_FILTER_KEY);

export interface WithTypeormQueryFilterOpts<Entity = unknown> {
  /**
   * Filter class (injection token)
   */
  filter: Class<CustomFilter>;
  /**
   * Used to register a filter on specific fields instead of types.
   * Note that arbitrary field names can be used, to support filters that are not mapped to real entity fields
   */
  fields: (string | keyof Entity)[];

  /**
   * Operations that this filters listens on
   */
  operations: string[];
}

export function WithTypeormQueryFilter(opts: WithTypeormQueryFilterOpts) {
  return <Cls extends Class<unknown>>(EntityClass: Cls): Cls | void => {
    reflector.append(EntityClass, opts);
  };
}

/**
 * @internal
 */
export function getTypeormEntityQueryFilters<Entity = unknown>(
  EntityClass: Class<Entity>,
): WithTypeormQueryFilterOpts[] {
  return reflector.get(EntityClass) ?? [];
}
