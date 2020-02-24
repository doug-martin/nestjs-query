import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { validateSync, MinLength } from 'class-validator';
import { UpdateOneArgsType } from '../../src';

describe('UpdateOneInputType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  class FakeType {
    @MinLength(5)
    name!: string;
  }
  it('should create an args type with the field as the type', () => {
    UpdateOneArgsType(FakeType);
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual(FakeType);
  });

  it('should return the input when accessing the update field', () => {
    const Type = UpdateOneArgsType(FakeType);
    const input = { id: 1, input: {} };
    const it = plainToClass(Type, input);
    expect(it.input).toEqual(input.input);
  });

  describe('validation', () => {
    it('should validate id is defined is not empty', () => {
      const Type = UpdateOneArgsType(FakeType);
      const input = { input: { name: 'hello world' } };
      const it = plainToClass(Type, input);
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

    it('should validate id is not empty is defined is not empty', () => {
      const Type = UpdateOneArgsType(FakeType);
      const input = { id: '', input: { name: 'hello world' } };
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'id should not be empty',
          },
          property: 'id',
          target: input,
          value: input.id,
        },
      ]);
    });

    it('should validate the update input', () => {
      const Type = UpdateOneArgsType(FakeType);
      const input = { id: 'id-1', input: {} };
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
