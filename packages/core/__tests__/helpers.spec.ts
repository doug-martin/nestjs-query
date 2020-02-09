import {
  Filter,
  Query,
  QueryFieldMap,
  SortDirection,
  SortField,
  transformFilter,
  transformQuery,
  transformSort,
} from '../src';

class TestDTO {
  first!: string;

  last!: string;
}

class TestEntity {
  firstName!: string;

  lastName!: string;
}

const fieldMap: QueryFieldMap<TestDTO, TestEntity> = {
  first: 'firstName',
  last: 'lastName',
};

describe('transformSort', () => {
  it('should return undefined if sorting is undefined', () => {
    expect(transformSort(undefined, fieldMap)).toBeUndefined();
  });

  it('should transform the fields to the correct names', () => {
    const dtoSort: SortField<TestDTO>[] = [
      { field: 'first', direction: SortDirection.DESC },
      { field: 'last', direction: SortDirection.ASC },
    ];
    const entitySort: SortField<TestEntity>[] = [
      { field: 'firstName', direction: SortDirection.DESC },
      { field: 'lastName', direction: SortDirection.ASC },
    ];
    expect(transformSort(dtoSort, fieldMap)).toEqual(entitySort);
  });

  it('should throw an error if the field name is not found', () => {
    const dtoSort: SortField<TestDTO>[] = [
      { field: 'first', direction: SortDirection.DESC },
      // @ts-ignore
      { field: 'lasts', direction: SortDirection.ASC },
    ];
    expect(() => transformSort(dtoSort, fieldMap)).toThrow(
      "No corresponding field found for 'lasts' when transforming SortField",
    );
  });
});

describe('transformFilter', () => {
  it('should return undefined if filter is undefined', () => {
    expect(transformFilter(undefined, fieldMap)).toBeUndefined();
  });

  it('should transform the fields to the correct names', () => {
    const dtoFilter: Filter<TestDTO> = {
      first: { eq: 'foo' },
      last: { neq: 'bar' },
    };
    const entityFilter: Filter<TestEntity> = {
      firstName: { eq: 'foo' },
      lastName: { neq: 'bar' },
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });

  it('should transform AND groupings to the correct names', () => {
    const dtoFilter: Filter<TestDTO> = {
      and: [{ first: { eq: 'foo' } }, { last: { neq: 'bar' } }],
    };
    const entityFilter: Filter<TestEntity> = {
      and: [{ firstName: { eq: 'foo' } }, { lastName: { neq: 'bar' } }],
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });

  it('should not transform AND groupings if the array is undefined', () => {
    const dtoFilter: Filter<TestDTO> = {
      and: undefined,
      first: { eq: 'foo' },
    };
    const entityFilter: Filter<TestEntity> = {
      and: undefined,
      firstName: { eq: 'foo' },
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });

  it('should transform OR groupings to the correct names', () => {
    const dtoFilter: Filter<TestDTO> = {
      or: [{ first: { eq: 'foo' } }, { last: { neq: 'bar' } }],
    };
    const entityFilter: Filter<TestEntity> = {
      or: [{ firstName: { eq: 'foo' } }, { lastName: { neq: 'bar' } }],
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });
  it('should transform nested groupings to the correct names', () => {
    const dtoFilter: Filter<TestDTO> = {
      or: [
        { and: [{ first: { eq: 'foo' } }, { last: { neq: 'bar' } }] },
        { or: [{ first: { eq: 'foo' } }, { last: { neq: 'bar' } }] },
      ],
    };
    const entityFilter: Filter<TestEntity> = {
      or: [
        { and: [{ firstName: { eq: 'foo' } }, { lastName: { neq: 'bar' } }] },
        { or: [{ firstName: { eq: 'foo' } }, { lastName: { neq: 'bar' } }] },
      ],
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });

  it('should throw an error if the field name is not found', () => {
    const dtoFilter: Filter<TestDTO> = {
      first: { eq: 'foo' },
      // @ts-ignore
      lasts: { neq: 'bar' },
    };
    expect(() => transformFilter(dtoFilter, fieldMap)).toThrow(
      "No corresponding field found for 'lasts' when transforming Filter",
    );
  });
});

describe('transformQuery', () => {
  it('should transform a Query', () => {
    const dtoQuery: Query<TestDTO> = {
      filter: {
        first: { eq: 'foo' },
        last: { neq: 'bar' },
      },
      paging: { offset: 10, limit: 10 },
      sorting: [
        { field: 'first', direction: SortDirection.DESC },
        { field: 'last', direction: SortDirection.ASC },
      ],
    };
    const entityQuery: Query<TestEntity> = {
      filter: {
        firstName: { eq: 'foo' },
        lastName: { neq: 'bar' },
      },
      paging: { offset: 10, limit: 10 },
      sorting: [
        { field: 'firstName', direction: SortDirection.DESC },
        { field: 'lastName', direction: SortDirection.ASC },
      ],
    };
    expect(transformQuery(dtoQuery, fieldMap)).toEqual(entityQuery);
  });
});
