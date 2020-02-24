import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { DeleteOneArgsType } from '../../src';

describe('DeleteOneArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an args type with the field as the type', () => {
    DeleteOneArgsType();
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = {};
      const it = plainToClass(DeleteOneArgsType(), input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'input should not be empty',
          },
          property: 'input',
          target: input,
        },
      ]);
    });

    it('should validate the id is not empty', () => {
      const input = { input: '' };
      const it = plainToClass(DeleteOneArgsType(), input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'input should not be empty',
          },
          property: 'input',
          target: input,
          value: '',
        },
      ]);
    });
  });
});
