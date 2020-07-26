import merge from 'lodash.merge';
import { Filter, Paging, Query, SortField } from '../interfaces';
import { FilterBuilder } from './filter.builder';
import { SortBuilder } from './sort.builder';
import { PageBuilder } from './page.builder';

export type QueryFieldMap<From, To, T extends keyof To = keyof To> = {
  [F in keyof From]?: T;
};

export const transformSort = <From, To>(
  sorting: SortField<From>[] | undefined,
  fieldMap: QueryFieldMap<From, To>,
): SortField<To>[] | undefined => {
  if (!sorting) {
    return undefined;
  }
  return sorting.map((sf) => {
    const field = fieldMap[sf.field];
    if (!field) {
      throw new Error(`No corresponding field found for '${sf.field as string}' when transforming SortField`);
    }
    return { ...sf, field } as SortField<To>;
  });
};

export const transformFilter = <From, To>(
  filter: Filter<From> | undefined,
  fieldMap: QueryFieldMap<From, To>,
): Filter<To> | undefined => {
  if (!filter) {
    return undefined;
  }
  return Object.keys(filter).reduce((newFilter, filterField) => {
    if (filterField === 'and' || filterField === 'or') {
      return { ...newFilter, [filterField]: filter[filterField]?.map((f) => transformFilter(f, fieldMap)) };
    }
    const fromField = filterField as keyof From;
    const otherKey = fieldMap[fromField];
    if (!otherKey) {
      throw new Error(`No corresponding field found for '${filterField}' when transforming Filter`);
    }
    return { ...newFilter, [otherKey as string]: filter[fromField] };
  }, {} as Filter<To>);
};

export const transformQuery = <From, To>(query: Query<From>, fieldMap: QueryFieldMap<From, To>): Query<To> => {
  return {
    filter: transformFilter(query.filter, fieldMap),
    paging: query.paging,
    sorting: transformSort(query.sorting, fieldMap),
  };
};

export const mergeQuery = <T>(base: Query<T>, source: Query<T>): Query<T> => {
  return merge(base, source);
};

export const getFilterFields = <DTO>(filter: Filter<DTO>): string[] => {
  const fieldSet: Set<string> = Object.keys(filter).reduce((fields: Set<string>, filterField: string): Set<string> => {
    if (filterField === 'and' || filterField === 'or') {
      const andOrFilters = filter[filterField];
      if (andOrFilters !== undefined) {
        return andOrFilters.reduce((andOrFields, andOrFilter) => {
          return new Set<string>([...andOrFields, ...getFilterFields(andOrFilter)]);
        }, fields);
      }
    } else {
      fields.add(filterField);
    }
    return fields;
  }, new Set<string>());
  return [...fieldSet];
};

export function applyFilter<DTO>(dto: DTO[], filter: Filter<DTO>): DTO[];
export function applyFilter<DTO>(dto: DTO, filter: Filter<DTO>): boolean;
export function applyFilter<DTO>(dtoOrArray: DTO | DTO[], filter: Filter<DTO>): boolean | DTO[] {
  const filterFunc = FilterBuilder.build(filter);
  if (Array.isArray(dtoOrArray)) {
    return dtoOrArray.filter((dto) => filterFunc(dto));
  }
  return filterFunc(dtoOrArray);
}

export const applySort = <DTO>(dtos: DTO[], sortFields: SortField<DTO>[]): DTO[] => {
  return SortBuilder.build(sortFields)(dtos);
};

export const applyPaging = <DTO>(dtos: DTO[], paging: Paging): DTO[] => {
  return PageBuilder.build<DTO>(paging)(dtos);
};

export const applyQuery = <DTO>(dtos: DTO[], query: Query<DTO>): DTO[] => {
  const filtered = applyFilter(dtos, query.filter ?? {});
  const sorted = applySort(filtered, query.sorting ?? []);
  return applyPaging(sorted, query.paging ?? {});
};
