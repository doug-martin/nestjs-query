// eslint-disable-next-line max-classes-per-file
import { ObjectType } from '@nestjs/graphql';
import { Relation, PagingStrategies, UnPagedRelation, OffsetConnection, FilterableRelation } from '../../src';
import {
  CursorConnection,
  FilterableCursorConnection,
  FilterableOffsetConnection,
  getRelations,
  FilterableUnPagedRelation,
} from '../../src/decorators';

@ObjectType()
class TestRelation {}

describe('@Relation', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @Relation('test', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({ one: { test: { DTO: TestRelation, allowFiltering: false, ...relationOpts } } });
  });
});

describe('@FilterableRelation', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @FilterableRelation('test', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({ one: { test: { DTO: TestRelation, ...relationOpts, allowFiltering: true } } });
  });
});

describe('@UnPagedConnection', () => {
  it('should set the isMany flag if the relationFn returns an array', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @UnPagedRelation('tests', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({
      many: {
        tests: { DTO: TestRelation, ...relationOpts, allowFiltering: false, pagingStrategy: PagingStrategies.NONE },
      },
    });
  });
});

describe('@FilterableUnPagedRelation', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @FilterableUnPagedRelation('test', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({
      many: {
        test: { DTO: TestRelation, pagingStrategy: PagingStrategies.NONE, ...relationOpts, allowFiltering: true },
      },
    });
  });
});

describe('@OffsetConnection', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @OffsetConnection('test', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({
      many: {
        test: { DTO: TestRelation, ...relationOpts, allowFiltering: false, pagingStrategy: PagingStrategies.OFFSET },
      },
    });
  });
});

describe('@FilterableOffsetConnection', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @FilterableOffsetConnection('test', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({
      many: {
        test: { DTO: TestRelation, ...relationOpts, pagingStrategy: PagingStrategies.OFFSET, allowFiltering: true },
      },
    });
  });
});

describe('@CursorConnection', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @CursorConnection('test', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({
      many: {
        test: { DTO: TestRelation, ...relationOpts, allowFiltering: false, pagingStrategy: PagingStrategies.CURSOR },
      },
    });
  });
});

describe('@FilterableCursorConnection', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @FilterableCursorConnection('test', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({
      many: {
        test: { DTO: TestRelation, ...relationOpts, pagingStrategy: PagingStrategies.CURSOR, allowFiltering: true },
      },
    });
  });
});

describe('getRelations', () => {
  @ObjectType()
  class SomeRelation {}

  @ObjectType({ isAbstract: true })
  @Relation('test', () => SomeRelation)
  @UnPagedRelation('unPagedTests', () => SomeRelation)
  @OffsetConnection('offsetTests', () => SomeRelation)
  @CursorConnection('cursorTests', () => SomeRelation)
  class BaseType {}

  @ObjectType()
  @Relation('implementedRelation', () => SomeRelation)
  @UnPagedRelation('implementedUnPagedRelations', () => SomeRelation)
  @OffsetConnection('implementedOffsetConnection', () => SomeRelation)
  @CursorConnection('implementedCursorConnection', () => SomeRelation)
  class ImplementingClass extends BaseType {}

  @ObjectType()
  @Relation('implementedRelation', () => SomeRelation, { relationName: 'test' })
  @UnPagedRelation('implementedUnPagedRelations', () => SomeRelation, { relationName: 'tests' })
  @OffsetConnection('implementedOffsetConnection', () => SomeRelation, { relationName: 'tests' })
  @CursorConnection('implementedCursorConnection', () => SomeRelation, { relationName: 'testConnection' })
  class DuplicateImplementor extends ImplementingClass {}

  it('should return relations for a type', () => {
    expect(getRelations(BaseType)).toEqual({
      one: {
        test: { DTO: SomeRelation, allowFiltering: false },
      },
      many: {
        unPagedTests: { DTO: SomeRelation, allowFiltering: false, pagingStrategy: PagingStrategies.NONE },
        offsetTests: { DTO: SomeRelation, allowFiltering: false, pagingStrategy: PagingStrategies.OFFSET },
        cursorTests: { DTO: SomeRelation, allowFiltering: false, pagingStrategy: PagingStrategies.CURSOR },
      },
    });
  });

  it('should return inherited relations fields for a type', () => {
    expect(getRelations(ImplementingClass)).toEqual({
      one: {
        test: { DTO: SomeRelation, allowFiltering: false },
        implementedRelation: { DTO: SomeRelation, allowFiltering: false },
      },
      many: {
        unPagedTests: { DTO: SomeRelation, allowFiltering: false, pagingStrategy: PagingStrategies.NONE },
        offsetTests: { DTO: SomeRelation, allowFiltering: false, pagingStrategy: PagingStrategies.OFFSET },
        cursorTests: { DTO: SomeRelation, allowFiltering: false, pagingStrategy: PagingStrategies.CURSOR },
        implementedUnPagedRelations: {
          DTO: SomeRelation,
          allowFiltering: false,
          pagingStrategy: PagingStrategies.NONE,
        },
        implementedOffsetConnection: {
          DTO: SomeRelation,
          allowFiltering: false,
          pagingStrategy: PagingStrategies.OFFSET,
        },
        implementedCursorConnection: {
          DTO: SomeRelation,
          allowFiltering: false,
          pagingStrategy: PagingStrategies.CURSOR,
        },
      },
    });
  });

  it('should exclude duplicate inherited relations fields for a type', () => {
    expect(getRelations(DuplicateImplementor)).toEqual({
      one: {
        test: { DTO: SomeRelation, allowFiltering: false },
        implementedRelation: { DTO: SomeRelation, allowFiltering: false, relationName: 'test' },
      },
      many: {
        unPagedTests: { DTO: SomeRelation, allowFiltering: false, pagingStrategy: PagingStrategies.NONE },
        offsetTests: { DTO: SomeRelation, allowFiltering: false, pagingStrategy: PagingStrategies.OFFSET },
        cursorTests: { DTO: SomeRelation, allowFiltering: false, pagingStrategy: PagingStrategies.CURSOR },
        implementedUnPagedRelations: {
          DTO: SomeRelation,
          allowFiltering: false,
          pagingStrategy: PagingStrategies.NONE,
          relationName: 'tests',
        },
        implementedOffsetConnection: {
          DTO: SomeRelation,
          allowFiltering: false,
          pagingStrategy: PagingStrategies.OFFSET,
          relationName: 'tests',
        },
        implementedCursorConnection: {
          DTO: SomeRelation,
          allowFiltering: false,
          pagingStrategy: PagingStrategies.CURSOR,
          relationName: 'testConnection',
        },
      },
    });
  });
});
