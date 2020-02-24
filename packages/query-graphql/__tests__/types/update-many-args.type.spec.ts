import 'reflect-metadata';
import { Filter } from '@nestjs-query/core';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { MinLength, validateSync } from 'class-validator';
import { UpdateManyArgsType } from '../../src';

describe('UpdateManyArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  class FakeType {
    @MinLength(5)
    name!: string;
  }
  class FakeFilter implements Filter<FakeType> {}
  it('should create an args type with an array field', () => {
    UpdateManyArgsType(FakeFilter, FakeType);
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeFilter);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual(FakeType);
  });

  it('should return the input when accessing the update field', () => {
    const Type = UpdateManyArgsType(FakeFilter, FakeType);
    const input = { input: {} };
    const it = plainToClass(Type, input);
    expect(it.input).toEqual(input.input);
  });

  describe('validation', () => {
    it('should validate the filter is not empty', () => {
      const Type = UpdateManyArgsType(FakeFilter, FakeType);
      const input = { input: { name: 'hello world' } };
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmptyObject: 'filter must be a non-empty object',
          },
          property: 'filter',
          target: input,
        },
      ]);
    });

    it('should validate the update input', () => {
      const Type = UpdateManyArgsType(FakeFilter, FakeType);
      const input = { filter: { name: { eq: 'hello world' } }, input: {} };
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [],
              constraints: {
                minLength: 'name must be longer than or equal to 5 characters',
              },
              property: 'name',
              target: {},
            },
          ],
          property: 'input',
          target: it,
          value: it.input,
        },
      ]);
    });
  });
});
