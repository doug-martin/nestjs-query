import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { RelationArgsType } from '../../src';

describe('RelationArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an args type with an array field', () => {
    RelationArgsType();
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual(typeGraphql.ID);
  });

  it('should return the input when accessing the update field', () => {
    const input: RelationArgsType = { id: 1, relationId: 2 };
    const it = plainToClass(RelationArgsType(), input);
    expect(it.id).toEqual(input.id);
    expect(it.relationId).toEqual(input.relationId);
  });
});
