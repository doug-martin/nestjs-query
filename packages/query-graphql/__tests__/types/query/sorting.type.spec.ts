import 'reflect-metadata';
import { ObjectType } from 'type-graphql';
import { getMetadataStorage } from '../../../src/metadata';
import { SortType } from '../../../src';

describe('SortingType', (): void => {
  beforeAll(() => getMetadataStorage().clear());
  afterAll(() => getMetadataStorage().clear());

  it('should throw an error if the class is not annotated with @ObjectType', () => {
    class TestSort {}
    expect(() => SortType(TestSort)).toThrow(
      'Unable to make SortType. Ensure TestSort is annotated with type-graphql @ObjectType',
    );
  });
  it('should throw an error if no fields are found', () => {
    @ObjectType()
    class TestSort {}
    expect(() => SortType(TestSort)).toThrow(
      'No fields found to create SortType for TestSort. Ensure fields are annotated with @FilterableField',
    );
  });
});
