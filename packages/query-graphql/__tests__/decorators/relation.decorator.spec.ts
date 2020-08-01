// eslint-disable-next-line max-classes-per-file
import { ObjectType } from '@nestjs/graphql';
import { Relation, Connection, PagingStrategies, FilterableRelation, FilterableConnection } from '../../src';
import { getRelations } from '../../src/decorators';

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
    expect(relations).toEqual({ one: { test: { DTO: TestRelation, ...relationOpts } } });
  });

  it('should set the isMany flag if the relationFn returns an array', () => {
    const relationFn = () => [TestRelation];
    const relationOpts = { disableRead: true };
    @ObjectType()
    @Relation('tests', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({
      many: { tests: { DTO: TestRelation, ...relationOpts, pagingStrategy: PagingStrategies.OFFSET } },
    });
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

  it('should set the isMany flag if the relationFn returns an array', () => {
    const relationFn = () => [TestRelation];
    const relationOpts = { disableRead: true };
    @ObjectType()
    @FilterableRelation('tests', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({
      many: {
        tests: { DTO: TestRelation, ...relationOpts, pagingStrategy: PagingStrategies.OFFSET, allowFiltering: true },
      },
    });
  });
});

describe('@Connection', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @Connection('test', relationFn, relationOpts)
    class TestDTO {}

    const relations = getRelations(TestDTO);
    expect(relations).toEqual({
      many: { test: { DTO: TestRelation, ...relationOpts, pagingStrategy: PagingStrategies.CURSOR } },
    });
  });
});

describe('@FilterableConnection', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @FilterableConnection('test', relationFn, relationOpts)
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
  @Relation('tests', () => [SomeRelation])
  @Connection('testConnection', () => SomeRelation)
  class BaseType {}

  @ObjectType()
  @Relation('implementedRelation', () => SomeRelation)
  @Relation('implementedRelations', () => [SomeRelation])
  @Connection('implementedConnection', () => SomeRelation)
  class ImplementingClass extends BaseType {}

  @ObjectType()
  @Relation('implementedRelation', () => SomeRelation, { relationName: 'test' })
  @Relation('implementedRelations', () => [SomeRelation], { relationName: 'tests' })
  @Connection('implementedConnection', () => SomeRelation, { relationName: 'testConnection' })
  class DuplicateImplementor extends ImplementingClass {}

  it('should return relations for a type', () => {
    expect(getRelations(BaseType)).toEqual({
      one: {
        test: { DTO: SomeRelation },
      },
      many: {
        tests: { DTO: SomeRelation, pagingStrategy: 'offset' },
        testConnection: { DTO: SomeRelation, pagingStrategy: 'cursor' },
      },
    });
  });

  it('should return inherited relations fields for a type', () => {
    expect(getRelations(ImplementingClass)).toEqual({
      one: {
        test: { DTO: SomeRelation },
        implementedRelation: { DTO: SomeRelation },
      },
      many: {
        tests: { DTO: SomeRelation, pagingStrategy: PagingStrategies.OFFSET },
        testConnection: { DTO: SomeRelation, pagingStrategy: PagingStrategies.CURSOR },
        implementedRelations: { DTO: SomeRelation, pagingStrategy: PagingStrategies.OFFSET },
        implementedConnection: { DTO: SomeRelation, pagingStrategy: PagingStrategies.CURSOR },
      },
    });
  });

  it('should exclude duplicate inherited relations fields for a type', () => {
    expect(getRelations(DuplicateImplementor)).toEqual({
      one: {
        test: { DTO: SomeRelation },
        implementedRelation: { DTO: SomeRelation, relationName: 'test' },
      },
      many: {
        tests: { DTO: SomeRelation, pagingStrategy: PagingStrategies.OFFSET },
        testConnection: { DTO: SomeRelation, pagingStrategy: PagingStrategies.CURSOR },
        implementedRelations: { DTO: SomeRelation, pagingStrategy: PagingStrategies.OFFSET, relationName: 'tests' },
        implementedConnection: {
          DTO: SomeRelation,
          pagingStrategy: PagingStrategies.CURSOR,
          relationName: 'testConnection',
        },
      },
    });
  });
});
