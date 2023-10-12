import { registerTypeComparison } from '@nestjs-query/query-graphql';
import { CustomFilter, CustomFilterResult, TypeOrmQueryFilter } from '@nestjs-query/query-typeorm';
import { Float, Int } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
// import { IsInt } from 'class-validator';
import { ColumnType } from 'typeorm';
import { randomString } from '../../../utils/randomString';

@TypeOrmQueryFilter({
  types: IsMultipleOfCustomFilter.types,
  operations: IsMultipleOfCustomFilter.operations,
})
export class IsMultipleOfCustomFilter implements CustomFilter {
  static readonly types: ColumnType[] = [Number, 'integer'];

  static readonly operations = ['isMultipleOf'];

  apply(field: string, cmp: string, val: unknown, alias?: string): CustomFilterResult {
    alias = alias ? alias : '';
    const pname = `param${randomString()}`;
    return {
      sql: `(${alias}.${field} % :${pname}) = 0`,
      params: { [pname]: val },
    };
  }
}

// Register the filter at the graphql level
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
registerTypeComparison([Number, Float, Int], 'isMultipleOf', {
  FilterType: Number,
  GqlType: Int,
  decorators: [IsInt()],
});
