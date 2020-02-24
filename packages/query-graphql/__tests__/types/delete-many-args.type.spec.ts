import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { DeleteManyArgsType } from '../../src';

describe('DeleteManyArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  class FakeFilter {}
  it('should create an args type with an array field', () => {
    DeleteManyArgsType(FakeFilter);
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeFilter);
  });

  describe('validation', () => {
    it('should validate the filter is defined', () => {
      const Type = DeleteManyArgsType(FakeFilter);
      const input = {};
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmptyObject: 'input must be a non-empty object',
          },
          property: 'input',
          target: input,
        },
      ]);
    });

    it('should validate the filter is not empty', () => {
      const Type = DeleteManyArgsType(FakeFilter);
      const input = { input: {} };
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmptyObject: 'input must be a non-empty object',
          },
          property: 'input',
          target: input,
          value: input.input,
        },
      ]);
    });
  });
});
