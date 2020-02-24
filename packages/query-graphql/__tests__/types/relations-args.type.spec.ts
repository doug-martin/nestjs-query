import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { RelationsArgsType } from '../../src';

describe('RelationsArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an args type with an array field', () => {
    RelationsArgsType();
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual([typeGraphql.ID]);
  });

  it('should return the input when accessing the update field', () => {
    const input: RelationsArgsType = { id: 1, relationIds: [2, 3, 4] };
    const it = plainToClass(RelationsArgsType(), input);
    expect(it.id).toEqual(input.id);
    expect(it.relationIds).toEqual(input.relationIds);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = { relationIds: [2, 3, 4] };
      const it = plainToClass(RelationsArgsType(), input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'id should not be empty',
          },
          property: 'id',
          target: input,
        },
      ]);
    });

    it('should validate the id is not empty', () => {
      const input = { id: '', relationIds: [2, 3, 4] };
      const it = plainToClass(RelationsArgsType(), input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'id should not be empty',
          },
          property: 'id',
          target: input,
          value: '',
        },
      ]);
    });

    it('should validate that relationsIds is not empty', () => {
      const input: RelationsArgsType = { id: 1, relationIds: [] };
      const it = plainToClass(RelationsArgsType(), input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            arrayNotEmpty: 'relationIds should not be empty',
          },
          property: 'relationIds',
          target: input,
          value: input.relationIds,
        },
      ]);
    });

    it('should validate that relationsIds is unique', () => {
      const input: RelationsArgsType = { id: 1, relationIds: [1, 2, 1, 2] };
      const it = plainToClass(RelationsArgsType(), input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            arrayUnique: "All relationIds's elements must be unique",
          },
          property: 'relationIds',
          target: input,
          value: input.relationIds,
        },
      ]);
    });

    it('should validate that relationsIds does not contain an empty id', () => {
      const input: RelationsArgsType = { id: 1, relationIds: [''] };
      const it = plainToClass(RelationsArgsType(), input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'each value in relationIds should not be empty',
          },
          property: 'relationIds',
          target: input,
          value: input.relationIds,
        },
      ]);
    });
  });
});
