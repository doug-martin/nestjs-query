// eslint-disable-next-line max-classes-per-file
import 'reflect-metadata';
import * as nestjsGraphql from '@nestjs/graphql';
import { FilterableField, PartialInputType, PartialType } from '../../src';

describe('PartialType', (): void => {
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');

  beforeEach(() => jest.clearAllMocks());

  describe('PartialType', () => {
    const objectTypeSpy = jest.spyOn(nestjsGraphql, 'ObjectType');

    @nestjsGraphql.ObjectType('TestPartialDto')
    class TestDto {
      @FilterableField(() => nestjsGraphql.ID)
      idField!: number;

      @FilterableField(() => nestjsGraphql.Int, { nullable: true })
      field1?: number;

      @FilterableField()
      field2!: string;
    }

    it('should throw an error if the type is not a registered graphql object', () => {
      expect(() => PartialType(class {})).toThrow('Unable to find fields for graphql type');
    });

    it('should throw an error if the type does not have any registered fields', () => {
      @nestjsGraphql.ObjectType()
      class BadClass {}

      expect(() => PartialType(BadClass)).toThrow('Unable to find fields for graphql type BadClass');
    });

    it('should create a copy of the object with all fields optional', () => {
      PartialType(TestDto);
      expect(objectTypeSpy).toBeCalledWith({ isAbstract: true });
      expect(fieldSpy).toBeCalledTimes(3);
      expect(fieldSpy.mock.calls[0]![0]!()).toEqual(nestjsGraphql.ID);
      expect(fieldSpy.mock.calls[0]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[1]![0]!()).toEqual(nestjsGraphql.Int);
      expect(fieldSpy.mock.calls[1]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[2]![0]!()).toEqual(String);
      expect(fieldSpy.mock.calls[2]![1]).toEqual({ nullable: true });
    });
  });

  describe('PartialInputType', () => {
    const inputTypeSpy = jest.spyOn(nestjsGraphql, 'InputType');
    @nestjsGraphql.InputType('TestPartialDto')
    class TestDto {
      @nestjsGraphql.Field(() => nestjsGraphql.ID)
      idField!: number;

      @nestjsGraphql.Field(() => nestjsGraphql.Int, { nullable: true })
      field1?: number;

      @nestjsGraphql.Field()
      field2!: string;
    }

    it('should throw an error if the type is not a registered graphql object', () => {
      expect(() => PartialInputType(class {})).toThrow('Unable to find fields for graphql type');
    });

    it('should throw an error if the type does not have any registered fields', () => {
      @nestjsGraphql.ObjectType()
      class BadClass {}

      expect(() => PartialInputType(BadClass)).toThrow('Unable to find fields for graphql type BadClass');
    });

    it('should create a copy of the object with all fields optional', () => {
      PartialInputType(TestDto);
      expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
      expect(fieldSpy).toBeCalledTimes(3);
      expect(fieldSpy.mock.calls[0]![0]!()).toEqual(nestjsGraphql.ID);
      expect(fieldSpy.mock.calls[0]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[1]![0]!()).toEqual(nestjsGraphql.Int);
      expect(fieldSpy.mock.calls[1]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[2]![0]!()).toEqual(String);
      expect(fieldSpy.mock.calls[2]![1]).toEqual({ nullable: true });
    });
  });
});
