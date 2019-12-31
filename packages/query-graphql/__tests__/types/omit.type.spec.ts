// eslint-disable-next-line max-classes-per-file
import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { FilterableField, OmitInputType, OmitObjectType } from '../../src';

describe('OmitType', (): void => {
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  beforeEach(() => fieldSpy.mockClear());

  describe('OmitObjectType', () => {
    const objectTypeSpy = jest.spyOn(typeGraphql, 'ObjectType');

    beforeEach(() => jest.clearAllMocks());

    @typeGraphql.ObjectType('TestOmitDto')
    class TestDto {
      @FilterableField(() => typeGraphql.ID)
      idField!: number;

      @FilterableField(() => typeGraphql.Int, { nullable: true })
      field1?: number;

      @FilterableField()
      field2!: string;
    }

    it('should throw an error if the type is not a registered graphql object', () => {
      expect(() => OmitObjectType(class {})).toThrow('Unable to find fields for type-graphql type');
    });

    it('should throw an error if the type does not have any registered fields', () => {
      @typeGraphql.ObjectType()
      class BadClass {}

      expect(() => OmitObjectType(BadClass)).toThrow('Unable to find fields for type-graphql type BadClass');
    });

    it('should create a copy of the object if no fields are specified', () => {
      OmitObjectType(TestDto);
      expect(objectTypeSpy).toBeCalledWith({ isAbstract: true });
      expect(fieldSpy).toBeCalledTimes(3);
      expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
      expect(fieldSpy.mock.calls[0]![1]).toEqual({});
      expect(fieldSpy.mock.calls[1]![0]!()).toEqual(typeGraphql.Int);
      expect(fieldSpy.mock.calls[1]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[2]![0]!()).toEqual(String);
      expect(fieldSpy.mock.calls[2]![1]).toEqual({});
    });

    it('should create an object with the specified fields excluded', () => {
      OmitObjectType(TestDto, 'idField', 'field2');
      expect(objectTypeSpy).toBeCalledWith({ isAbstract: true });
      expect(fieldSpy).toBeCalledTimes(1);
      expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.Int);
      expect(fieldSpy.mock.calls[0]![1]).toEqual({ nullable: true });
    });
  });

  describe('OmitInputType', () => {
    const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
    beforeEach(() => jest.clearAllMocks());
    @typeGraphql.InputType('TestOmitDto')
    class TestDto {
      @typeGraphql.Field(() => typeGraphql.ID)
      idField!: number;

      @typeGraphql.Field(() => typeGraphql.Int, { nullable: true })
      field1?: number;

      @typeGraphql.Field()
      field2!: string;
    }

    it('should throw an error if the type is not a registered graphql object', () => {
      expect(() => OmitInputType(class {})).toThrow('Unable to find fields for type-graphql type');
    });

    it('should throw an error if the type does not have any registered fields', () => {
      @typeGraphql.ObjectType()
      class BadClass {}

      expect(() => OmitInputType(BadClass)).toThrow('Unable to find fields for type-graphql type BadClass');
    });

    it('should create a copy of the object if no fields are specified', () => {
      OmitInputType(TestDto);
      expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
      expect(fieldSpy).toBeCalledTimes(3);
      expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
      expect(fieldSpy.mock.calls[0]![1]).toEqual({});
      expect(fieldSpy.mock.calls[1]![0]!()).toEqual(typeGraphql.Int);
      expect(fieldSpy.mock.calls[1]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[2]![0]!()).toEqual(String);
      expect(fieldSpy.mock.calls[2]![1]).toEqual({});
    });

    it('should create an object with the specified fields excluded', () => {
      OmitInputType(TestDto, 'idField', 'field2');
      expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
      expect(fieldSpy).toBeCalledTimes(1);
      expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.Int);
      expect(fieldSpy.mock.calls[0]![1]).toEqual({ nullable: true });
    });
  });
});
