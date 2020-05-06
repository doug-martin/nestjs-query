import { ObjectType } from '@nestjs/graphql';
import { Relation, Connection } from '../../src';
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
    expect(relations).toHaveLength(1);
    const relation = relations![0];
    expect(relation.name).toBe('test');
    expect(relation.relationTypeFunc).toBe(relationFn);
    expect(relation.isConnection).toBe(false);
    expect(relation.relationOpts).toBe(relationOpts);
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
    expect(relations).toHaveLength(1);
    const relation = relations![0];
    expect(relation.name).toBe('test');
    expect(relation.relationTypeFunc).toBe(relationFn);
    expect(relation.isConnection).toBe(true);
    expect(relation.relationOpts).toBe(relationOpts);
  });
});
