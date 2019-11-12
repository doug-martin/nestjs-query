import 'reflect-metadata';
import { ObjectType } from 'type-graphql';
import { getMetadataStorage } from '../../metadata';
import { GraphQLSortType } from './sorting.type';

describe('SortingType', (): void => {
  beforeAll(() => getMetadataStorage().clear());
  afterAll(() => getMetadataStorage().clear());

  it('should throw an error if the class is not annotated with @ObjectType', () => {
    class TestSort {}
    expect(() => GraphQLSortType(TestSort)).toThrow(
      'unable to make sort for class not registered with type-graphql TestSort',
    );
  });
  it('should throw an error if no fields are found', () => {
    @ObjectType()
    class TestSort {}
    expect(() => GraphQLSortType(TestSort)).toThrow('No fields found to create Sort for TestSort');
  });
});
