import { ColumnType, EntityManager } from 'typeorm';
import { randomString } from '../../src/common';
import { TypeOrmQueryFilter } from '../../src/decorators/typeorm-query-filter.decorator';
import { CustomFilter, CustomFilterResult } from '../../src/query';
import { TestRelation } from './test-relation.entity';

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
      sql: `(${alias}.${field} % :${pname}) == 0`,
      params: { [pname]: val },
    };
  }
}

@TypeOrmQueryFilter({
  types: IsMultipleOfDateCustomFilter.types,
  operations: IsMultipleOfDateCustomFilter.operations,
})
export class IsMultipleOfDateCustomFilter implements CustomFilter {
  static readonly types: ColumnType[] = [Date, 'date', 'datetime'];

  static readonly operations = ['isMultipleOf'];

  apply(field: string, cmp: string, val: unknown, alias?: string): CustomFilterResult {
    alias = alias ? alias : '';
    const pname = `param${randomString()}`;
    return {
      sql: `(EXTRACT(EPOCH FROM ${alias}.${field}) / 3600 / 24) % :${pname}) == 0`,
      params: { [pname]: val },
    };
  }
}

@TypeOrmQueryFilter()
export class RadiusCustomFilter implements CustomFilter {
  static readonly operations = ['distanceFrom'];

  apply(
    field: string,
    cmp: string,
    val: { point: { lat: number; lng: number }; radius: number },
    alias?: string,
  ): CustomFilterResult {
    alias = alias ? alias : '';
    const plat = `param${randomString()}`;
    const plng = `param${randomString()}`;
    const prad = `param${randomString()}`;
    return {
      sql: `ST_Distance(${alias}.${field}, ST_MakePoint(:${plat},:${plng})) <= :${prad}`,
      params: { [plat]: val.point.lat, [plng]: val.point.lng, [prad]: val.radius },
    };
  }
}

@TypeOrmQueryFilter()
export class TestEntityTestRelationCountFilter implements CustomFilter {
  constructor(private em: EntityManager) {}

  apply(field: string, cmp: string, val: unknown, alias?: string): CustomFilterResult {
    alias = alias ? alias : '';
    const pname = `param${randomString()}`;

    const subQb = this.em
      .createQueryBuilder(TestRelation, 'tr')
      .select('COUNT(*)')
      .where(`tr.numberType > 82 AND tr.test_entity_id = ${alias}.testEntityPk`);

    return {
      sql: `(${subQb.getSql()}) > :${pname}`,
      params: { [pname]: val },
    };
  }
}
