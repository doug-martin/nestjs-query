import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { FilterableField } from '../decorators/filterable-field.decorator';
import { PartialInputType, PartialType } from './partial.type';

describe('PartialType', (): void => {
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  beforeEach(() => fieldSpy.mockClear());

  describe('PartialType', () => {
    const objectTypeSpy = jest.spyOn(typeGraphql, 'ObjectType');

    beforeEach(() => objectTypeSpy.mockClear());

    @typeGraphql.ObjectType('TestPartialDto')
    class TestDto {
      @FilterableField(() => typeGraphql.ID)
      idField!: number;

      @FilterableField(() => typeGraphql.Int, { nullable: true })
      field1?: number;

      @FilterableField()
      field2!: string;
    }

    it('should throw an error if the type is not a registered graphql object', () => {
      expect(() => PartialType(class {})).toThrow('Unable to find fields for type-graphql type');
    });

    it('should throw an error if the type does not have any registered fields', () => {
      @typeGraphql.ObjectType()
      class BadClass {}

      expect(() => PartialType(BadClass)).toThrow('Unable to find fields for type-graphql type BadClass');
    });

    it('should create a copy of the object with all fields optional', () => {
      PartialType(TestDto);
      expect(objectTypeSpy).toBeCalledWith({ isAbstract: true });
      expect(fieldSpy).toBeCalledTimes(3);
      expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
      expect(fieldSpy.mock.calls[0]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[1]![0]!()).toEqual(typeGraphql.Int);
      expect(fieldSpy.mock.calls[1]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[2]![0]!()).toEqual(String);
      expect(fieldSpy.mock.calls[2]![1]).toEqual({ nullable: true });
    });
  });

  describe('PartialInputType', () => {
    const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
    beforeEach(() => inputTypeSpy.mockClear());
    @typeGraphql.InputType('TestPartialDto')
    class TestDto {
      @typeGraphql.Field(() => typeGraphql.ID)
      idField!: number;

      @typeGraphql.Field(() => typeGraphql.Int, { nullable: true })
      field1?: number;

      @typeGraphql.Field()
      field2!: string;
    }

    it('should throw an error if the type is not a registered graphql object', () => {
      expect(() => PartialInputType(class {})).toThrow('Unable to find fields for type-graphql type');
    });

    it('should throw an error if the type does not have any registered fields', () => {
      @typeGraphql.ObjectType()
      class BadClass {}

      expect(() => PartialInputType(BadClass)).toThrow('Unable to find fields for type-graphql type BadClass');
    });

    it('should create a copy of the object with all fields optional', () => {
      PartialInputType(TestDto);
      expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
      expect(fieldSpy).toBeCalledTimes(3);
      expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
      expect(fieldSpy.mock.calls[0]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[1]![0]!()).toEqual(typeGraphql.Int);
      expect(fieldSpy.mock.calls[1]![1]).toEqual({ nullable: true });
      expect(fieldSpy.mock.calls[2]![0]!()).toEqual(String);
      expect(fieldSpy.mock.calls[2]![1]).toEqual({ nullable: true });
    });
  });
});
