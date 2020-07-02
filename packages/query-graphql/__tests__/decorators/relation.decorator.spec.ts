// eslint-disable-next-line max-classes-per-file
import { ObjectType } from '@nestjs/graphql';
import { Relation, Connection, PagingStrategies, FilterableRelation, FilterableConnection } from '../../src';
import { getMetadataStorage } from '../../src/metadata';

@ObjectType()
class TestRelation {}

describe('@Relation', () => {
  it('should add the relation metadata to the metadata storage', () => {
    const relationFn = () => TestRelation;
    const relationOpts = { disableRead: true };
    @ObjectType()
    @Relation('test', relationFn, relationOpts)
    class TestDTO {}

    const relations = getMetadataStorage().getRelations(TestDTO);
    expect(relations).toEqual({ one: { test: { DTO: TestRelation, ...relationOpts } } });
  });

  it('should set the isMany flag if the relationFn returns an array', () => {
    const relationFn = () => [TestRelation];
    const relationOpts = { disableRead: true };
    @ObjectType()
    @Relation('tests', relationFn, relationOpts)
    class TestDTO {}

    const relations = getMetadataStorage().getRelations(TestDTO);
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

    const relations = getMetadataStorage().getRelations(TestDTO);
    expect(relations).toEqual({ one: { test: { DTO: TestRelation, ...relationOpts, allowFiltering: true } } });
  });

  it('should set the isMany flag if the relationFn returns an array', () => {
    const relationFn = () => [TestRelation];
    const relationOpts = { disableRead: true };
    @ObjectType()
    @FilterableRelation('tests', relationFn, relationOpts)
    class TestDTO {}

    const relations = getMetadataStorage().getRelations(TestDTO);
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

    const relations = getMetadataStorage().getRelations(TestDTO);
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

    const relations = getMetadataStorage().getRelations(TestDTO);
    expect(relations).toEqual({
      many: {
        test: { DTO: TestRelation, ...relationOpts, pagingStrategy: PagingStrategies.CURSOR, allowFiltering: true },
      },
    });
  });
});
