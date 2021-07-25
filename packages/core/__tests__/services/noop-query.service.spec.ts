import { NoOpQueryService } from '../../src/services/noop-query.service';
import { QueryService } from '../../src';
import { DeepPartial } from '../../src/common';

describe('NoOpQueryService', () => {
  class TestType {
    foo!: string;
  }

  const instance: QueryService<TestType> = NoOpQueryService.getInstance<
    TestType,
    DeepPartial<TestType>,
    DeepPartial<TestType>
  >();

  it('should throw a NotImplementedException when calling addRelations', () =>
    expect(instance.addRelations('test', 1, [1, 2, 3])).rejects.toThrow('addRelations is not implemented'));

  it('should throw a NotImplementedException when calling createMany', () =>
    expect(instance.createMany([{ foo: 'bar' }])).rejects.toThrow('createMany is not implemented'));

  it('should throw a NotImplementedException when calling createOne', () =>
    expect(instance.createOne({ foo: 'bar' })).rejects.toThrow('createOne is not implemented'));

  it('should throw a NotImplementedException when calling deleteMany', () =>
    expect(instance.deleteMany({ foo: { eq: 'bar' } })).rejects.toThrow('deleteMany is not implemented'));

  it('should throw a NotImplementedException when calling deleteOne', () =>
    expect(instance.deleteOne(1)).rejects.toThrow('deleteOne is not implemented'));

  it('should throw a NotImplementedException when calling findById', () =>
    expect(instance.findById(1)).rejects.toThrow('findById is not implemented'));

  it('should throw a NotImplementedException when calling findRelation', () =>
    expect(instance.findRelation(TestType, 'test', new TestType())).rejects.toThrow('findRelation is not implemented'));

  it('should throw a NotImplementedException when calling getById', () =>
    expect(instance.getById(1)).rejects.toThrow('getById is not implemented'));

  it('should throw a NotImplementedException when calling query', () =>
    expect(instance.query({})).rejects.toThrow('query is not implemented'));

  it('should throw a NotImplementedException when calling aggregate', () =>
    expect(instance.aggregate({}, {})).rejects.toThrow('aggregate is not implemented'));

  it('should throw a NotImplementedException when calling count', () =>
    expect(instance.count({})).rejects.toThrow('count is not implemented'));

  it('should throw a NotImplementedException when calling queryRelations', () =>
    expect(instance.queryRelations(TestType, 'test', new TestType(), {})).rejects.toThrow(
      'queryRelations is not implemented',
    ));

  it('should throw a NotImplementedException when calling countRelations', () =>
    expect(instance.countRelations(TestType, 'test', new TestType(), {})).rejects.toThrow(
      'countRelations is not implemented',
    ));

  it('should throw a NotImplementedException when calling removeRelation', () =>
    expect(instance.removeRelation('test', 1, 2)).rejects.toThrow('removeRelation is not implemented'));

  it('should throw a NotImplementedException when calling removeRelations', () =>
    expect(instance.removeRelations('test', 1, [1, 2, 3])).rejects.toThrow('removeRelations is not implemented'));

  it('should throw a NotImplementedException when calling setRelation', () =>
    expect(instance.setRelation('test', 1, 1)).rejects.toThrow('setRelation is not implemented'));

  it('should throw a NotImplementedException when calling setRelations', () =>
    expect(instance.setRelations('test', 1, [1])).rejects.toThrow('setRelations is not implemented'));

  it('should throw a NotImplementedException when calling updateMany', () =>
    expect(instance.updateMany({ foo: 'bar' }, {})).rejects.toThrow('updateMany is not implemented'));

  it('should throw a NotImplementedException when calling updateOne', () =>
    expect(instance.updateOne(1, { foo: 'bar' })).rejects.toThrow('updateOne is not implemented'));

  it('should throw a NotImplementedException when calling aggregateRelations', () =>
    expect(instance.aggregateRelations(TestType, 'test', new TestType(), {}, {})).rejects.toThrow(
      'aggregateRelations is not implemented',
    ));
});
