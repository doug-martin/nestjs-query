import 'reflect-metadata';
import * as nestjsGraphql from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { MinLength, validateSync } from 'class-validator';
import { CreateOneInputType } from '../../src';

describe('CreateOneInputType', (): void => {
  const inputTypeSpy = jest.spyOn(nestjsGraphql, 'InputType');
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');

  class FakeType {
    @MinLength(5)
    field!: string;
  }
  it('should create an InputType with the field as the type', () => {
    CreateOneInputType(FakeType, FakeType);
    expect(inputTypeSpy).toBeCalledWith(`CreateOneFakeTypeInput`);
    expect(inputTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeType);
  });

  it('should properly assign the input field', () => {
    const Type = CreateOneInputType(FakeType, FakeType);
    const input = { field: 'hello' };
    const it = plainToClass(Type, { input });
    expect(it.input).toEqual(input);
    expect(it.input).toBeInstanceOf(FakeType);
  });

  it('should assign the typeName to the input field', () => {
    const Type = CreateOneInputType(FakeType, FakeType);
    const input = { field: 'hello' };
    const it = plainToClass(Type, { fakeType: input });
    expect(it.input).toEqual(input);
    expect(it.input).toBeInstanceOf(FakeType);
  });

  describe('validation', () => {
    it('should validate the input property', () => {
      const Type = CreateOneInputType(FakeType, FakeType);
      const input = { field: 'hola' };
      const it = plainToClass(Type, { input });
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [],
              constraints: {
                minLength: 'field must be longer than or equal to 5 characters',
              },
              property: 'field',
              target: input,
              value: input.field,
            },
          ],
          property: 'input',
          target: { input },
          value: input,
        },
      ]);
    });

    it('should assign the typeName to the input field', () => {
      const Type = CreateOneInputType(FakeType, FakeType);
      const input = { field: 'hola' };
      const it = plainToClass(Type, { fakeType: input });
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [],
              constraints: {
                minLength: 'field must be longer than or equal to 5 characters',
              },
              property: 'field',
              target: input,
              value: input.field,
            },
          ],
          property: 'input',
          target: { input },
          value: input,
        },
      ]);
    });
  });
});
