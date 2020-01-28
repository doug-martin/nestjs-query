import 'reflect-metadata';
import { IsInt, Min } from 'class-validator';
import { ArgumentValidationError, ObjectType, Field } from 'type-graphql';
import { getDTONames, transformAndValidate } from '../../src/resolvers/helpers';

describe('helpers', () => {
  describe('getDTONames', () => {
    @ObjectType('SomeDTO')
    class DTO {
      @Field()
      str!: string;
    }

    it('should use the type-graphql name for the dto', () => {
      const { baseName, baseNameLower, pluralBaseNameLower, pluralBaseName } = getDTONames({}, DTO);
      expect(baseName).toBe('SomeDTO');
      expect(baseNameLower).toBe('someDTO');
      expect(pluralBaseName).toBe('SomeDTOS');
      expect(pluralBaseNameLower).toBe('someDTOS');
    });

    it('should use the dtoName if specified', () => {
      const { baseName, baseNameLower, pluralBaseNameLower, pluralBaseName } = getDTONames(
        { dtoName: 'NamedObj' },
        DTO,
      );
      expect(baseName).toBe('NamedObj');
      expect(baseNameLower).toBe('namedObj');
      expect(pluralBaseName).toBe('NamedObjs');
      expect(pluralBaseNameLower).toBe('namedObjs');
    });

    it('should fall back to the class name', () => {
      class OtherDTO {
        @Field()
        str!: string;
      }

      const { baseName, baseNameLower, pluralBaseNameLower, pluralBaseName } = getDTONames({}, OtherDTO);
      expect(baseName).toBe('OtherDTO');
      expect(baseNameLower).toBe('otherDTO');
      expect(pluralBaseName).toBe('OtherDTOS');
      expect(pluralBaseNameLower).toBe('otherDTOS');
    });
  });

  describe('transformAndValidate', () => {
    class TestClass {
      @IsInt()
      @Min(0)
      int = 0;
    }

    it('should not transform or validate a class that is already an instance', async () => {
      const instance = new TestClass();
      const v = await transformAndValidate(TestClass, instance);
      expect(v).toBe(instance);
    });

    it('should transform and validate an object into the class', async () => {
      const v = await transformAndValidate(TestClass, { int: 1 });
      expect(v).toBeInstanceOf(TestClass);
      expect(v.int).toBe(1);
      return expect(transformAndValidate(TestClass, { int: -1 })).rejects.toBeInstanceOf(ArgumentValidationError);
    });
  });
});
