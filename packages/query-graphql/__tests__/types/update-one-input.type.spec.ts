import 'reflect-metadata';
import * as nestjsGraphql from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { validateSync, MinLength } from 'class-validator';
import { ObjectType } from '@nestjs/graphql';
import { UpdateOneInputType } from '../../src';

describe('UpdateOneInputType', (): void => {
  const inputType = jest.spyOn(nestjsGraphql, 'InputType');
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');

  @ObjectType()
  class FakeType {
    @MinLength(5)
    name!: string;
  }
  it('should create an args type with the field as the type', () => {
    UpdateOneInputType(FakeType);
    expect(inputType).toBeCalledTimes(1);
    expect(inputType).toBeCalledWith({ isAbstract: true });
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(nestjsGraphql.ID);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual(FakeType);
  });

  describe('validation', () => {
    it('should validate id is defined is not empty', () => {
      const Type = UpdateOneInputType(FakeType);
      const input = { update: { name: 'hello world' } };
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
      const Type = UpdateOneInputType(FakeType);
      const input = { id: '', update: { name: 'hello world' } };
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
      const Type = UpdateOneInputType(FakeType);
      const input = { id: 'id-1', update: {} };
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
          property: 'update',
          target: it,
          value: it.update,
        },
      ]);
    });
  });
});
