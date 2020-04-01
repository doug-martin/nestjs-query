import { Filter, Query, SortField } from './interfaces';

export type QueryFieldMap<From, To> = {
  [F in keyof From]?: keyof To;
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
      throw new Error(`No corresponding field found for '${sf.field}' when transforming SortField`);
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
