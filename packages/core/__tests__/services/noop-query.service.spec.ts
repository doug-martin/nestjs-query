import { NoOpQueryService } from '../../src/services/noop-query.service';
import { QueryService } from '../../src';

describe('NoOpQueryService', () => {
  class TestType {
    foo!: string;
  }

  const instance: QueryService<TestType> = NoOpQueryService.getInstance<TestType>();
  it('should throw a NotImplementedException when calling addRelations', () => {
    expect(instance.addRelations('test', 1, [1, 2, 3])).rejects.toThrowError('addRelations is not implemented');
  });
  it('should throw a NotImplementedException when calling createMany', () => {
    expect(instance.createMany([{ foo: 'bar' }])).rejects.toThrowError('createMany is not implemented');
  });
  it('should throw a NotImplementedException when calling createOne', () => {
    expect(instance.createOne({ foo: 'bar' })).rejects.toThrowError('createOne is not implemented');
  });
  it('should throw a NotImplementedException when calling deleteMany', () => {
    expect(instance.deleteMany({ foo: { eq: 'bar' } })).rejects.toThrowError('deleteMany is not implemented');
  });
  it('should throw a NotImplementedException when calling deleteOne', () => {
    expect(instance.deleteOne(1)).rejects.toThrowError('deleteOne is not implemented');
  });
  it('should throw a NotImplementedException when calling findById', () => {
    expect(instance.findById(1)).rejects.toThrowError('findById is not implemented');
  });
  it('should throw a NotImplementedException when calling findRelation', () => {
    expect(instance.findRelation(TestType, 'test', new TestType())).rejects.toThrowError(
      'findRelation is not implemented',
    );
  });
  it('should throw a NotImplementedException when calling getById', () => {
    expect(instance.getById(1)).rejects.toThrowError('getById is not implemented');
  });
  it('should throw a NotImplementedException when calling query', () => {
    expect(instance.query({})).rejects.toThrowError('query is not implemented');
  });
  it('should throw a NotImplementedException when calling queryRelations', () => {
    expect(instance.queryRelations(TestType, 'test', new TestType(), {})).rejects.toThrowError(
      'queryRelations is not implemented',
    );
  });
  it('should throw a NotImplementedException when calling removeRelation', () => {
    expect(instance.removeRelation('test', 1, 2)).rejects.toThrowError('removeRelation is not implemented');
  });
  it('should throw a NotImplementedException when calling removeRelations', () => {
    expect(instance.removeRelations('test', 1, [1, 2, 3])).rejects.toThrowError('removeRelations is not implemented');
  });
  it('should throw a NotImplementedException when calling setRelation', () => {
    expect(instance.setRelation('test', 1, 1)).rejects.toThrowError('setRelation is not implemented');
  });
  it('should throw a NotImplementedException when calling updateMany', () => {
    expect(instance.updateMany({ foo: 'bar' }, {})).rejects.toThrowError('updateMany is not implemented');
  });
  it('should throw a NotImplementedException when calling updateOne', () => {
    expect(instance.updateOne(1, { foo: 'bar' })).rejects.toThrowError('updateOne is not implemented');
  });
});
