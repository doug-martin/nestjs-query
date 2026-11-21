import { CustomFilter, CustomFilterResult, TypeOrmQueryFilter } from '@nestjs-query/query-typeorm';

@TypeOrmQueryFilter()
export class TodoItemLowPriorityFilter implements CustomFilter {
  apply(field: string, cmp: string, val: unknown, alias?: string): CustomFilterResult {
    alias = alias ? alias : '';
    return {
      sql: `(${alias}.priority < 3)`,
      params: {},
    };
  }
}
