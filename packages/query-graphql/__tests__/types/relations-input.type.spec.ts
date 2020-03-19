import 'reflect-metadata';
import * as nestjsGraphql from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { RelationsInputType } from '../../src';

describe('RelationsInputType', (): void => {
  const inputTypeSpy = jest.spyOn(nestjsGraphql, 'InputType');
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');

  it('should create an args type with an array field', () => {
    RelationsInputType();
    expect(inputTypeSpy).toBeCalledWith();
    expect(inputTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(nestjsGraphql.ID);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual([nestjsGraphql.ID]);
  });

  it('should return the input when accessing the update field', () => {
    const input: RelationsInputType = { id: 1, relationIds: [2, 3, 4] };
    const it = plainToClass(RelationsInputType(), input);
    expect(it.id).toEqual(input.id);
    expect(it.relationIds).toEqual(input.relationIds);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = { relationIds: [2, 3, 4] };
      const it = plainToClass(RelationsInputType(), input);
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
      const it = plainToClass(RelationsInputType(), input);
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
      const input: RelationsInputType = { id: 1, relationIds: [] };
      const it = plainToClass(RelationsInputType(), input);
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
      const input: RelationsInputType = { id: 1, relationIds: [1, 2, 1, 2] };
      const it = plainToClass(RelationsInputType(), input);
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
      const input: RelationsInputType = { id: 1, relationIds: [''] };
      const it = plainToClass(RelationsInputType(), input);
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
