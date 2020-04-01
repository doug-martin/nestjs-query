import 'reflect-metadata';
import * as nestjsGraphql from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { validateSync, MinLength } from 'class-validator';
import { CreateManyInputType } from '../../src';

describe('CreateManyInputType', (): void => {
  const inputTypeSpy = jest.spyOn(nestjsGraphql, 'InputType');
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');

  class FakeType {
    @MinLength(5)
    field!: string;
  }

  it('should create an InputType with an array field', () => {
    CreateManyInputType(FakeType, FakeType);
    expect(inputTypeSpy).toBeCalledWith(`CreateManyFakeTypesInput`);
    expect(inputTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual([FakeType]);
  });

  it('should properly assign the input field', () => {
    const Type = CreateManyInputType(FakeType, FakeType);
    const input = [{ field: 'hello' }];
    const it = plainToClass(Type, { input });
    expect(it.input).toEqual(input);
    it.input.forEach((i) => expect(i).toBeInstanceOf(FakeType));
  });

  it('should assign the typeName to the input field', () => {
    const Type = CreateManyInputType(FakeType, FakeType);
    const input = [{ field: 'hello' }];
    const it = plainToClass(Type, { fakeTypes: input });
    expect(it.input).toEqual(input);
    it.input.forEach((i) => expect(i).toBeInstanceOf(FakeType));
  });

  describe('validation', () => {
    it('should validate the input property', () => {
      const Type = CreateManyInputType(FakeType, FakeType);
      const input = [{ field: 'hola' }];
      const it = plainToClass(Type, { input });
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [
                {
                  children: [],
                  constraints: {
                    minLength: 'field must be longer than or equal to 5 characters',
                  },
                  property: 'field',
                  target: input[0],
                  value: input[0].field,
                },
              ],
              property: '0',
              target: input,
              value: input[0],
            },
          ],
          property: 'input',
          target: {
            input,
          },
          value: input,
        },
      ]);
    });

    it('should assign the typeName to the input field', () => {
      const Type = CreateManyInputType(FakeType, FakeType);
      const input = [{ field: 'hola' }];
      const it = plainToClass(Type, { fakeTypes: input });
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [
                {
                  children: [],
                  constraints: {
                    minLength: 'field must be longer than or equal to 5 characters',
                  },
                  property: 'field',
                  target: input[0],
                  value: input[0].field,
                },
              ],
              property: '0',
              target: input,
              value: input[0],
            },
          ],
          property: 'input',
          target: {
            input,
          },
          value: input,
        },
      ]);
    });
  });
});
