import 'reflect-metadata';
import * as nestjsGraphql from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { DeleteOneInputType } from '../../src';

describe('DeleteOneInputType', (): void => {
  const inputTypeSpy = jest.spyOn(nestjsGraphql, 'InputType');
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');

  it('should create an args type with the field as the type', () => {
    DeleteOneInputType();
    expect(inputTypeSpy).toBeCalledWith();
    expect(inputTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(nestjsGraphql.ID);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = {};
      const it = plainToClass(DeleteOneInputType(), input);
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
      const input = { id: '' };
      const it = plainToClass(DeleteOneInputType(), input);
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
  });
});
