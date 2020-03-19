import 'reflect-metadata';
import * as nestjsGraphql from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { RelationInputType } from '../../src';

describe('RelationInputType', (): void => {
  const inputTypeSpy = jest.spyOn(nestjsGraphql, 'InputType');
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');

  it('should create an args type with an array field', () => {
    RelationInputType();
    expect(inputTypeSpy).toBeCalledWith();
    expect(inputTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(nestjsGraphql.ID);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual(nestjsGraphql.ID);
  });

  it('should return the input when accessing the update field', () => {
    const input: RelationInputType = { id: 1, relationId: 2 };
    const it = plainToClass(RelationInputType(), input);
    expect(it.id).toEqual(input.id);
    expect(it.relationId).toEqual(input.relationId);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = { relationId: 1 };
      const it = plainToClass(RelationInputType(), input);
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
      const input = { id: '', relationId: 1 };
      const it = plainToClass(RelationInputType(), input);
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

    it('should validate that relationId is defined', () => {
      const input = { id: 1 };
      const it = plainToClass(RelationInputType(), input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'relationId should not be empty',
          },
          property: 'relationId',
          target: input,
        },
      ]);
    });

    it('should validate that relationId is not empty', () => {
      const input: RelationInputType = { id: 1, relationId: '' };
      const it = plainToClass(RelationInputType(), input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'relationId should not be empty',
          },
          property: 'relationId',
          target: input,
          value: input.relationId,
        },
      ]);
    });
  });
});
