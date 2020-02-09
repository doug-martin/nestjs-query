import * as classTransformer from 'class-transformer';
import { Assembler, ClassTransformerAssembler } from '../../src';

describe('ClassTransformerAssembler', () => {
  const plainToClassSpy = jest.spyOn(classTransformer, 'plainToClass');

  class TestDTO {
    firstName!: string;

    lastName!: string;
  }

  class TestEntity {
    firstName!: string;

    lastName!: string;
  }

  @Assembler(TestDTO, TestEntity)
  class TestClassAssembler extends ClassTransformerAssembler<TestDTO, TestEntity> {}

  beforeEach(() => jest.clearAllMocks());

  describe('convertToDTO', () => {
    it('should call plainToClass with the DTO class and the passed in entity', () => {
      const input = { firstName: 'foo', lastName: 'bar' };
      const assembler = new TestClassAssembler();
      const converted = assembler.convertToDTO(input);
      expect(converted).toBeInstanceOf(TestDTO);
      expect(plainToClassSpy).toBeCalledTimes(1);
      expect(plainToClassSpy).toBeCalledWith(TestDTO, input);
    });
  });

  describe('convertToEntity', () => {
    it('should call plainToClass with the Entity class and the passed in dto', () => {
      const input = { firstName: 'foo', lastName: 'bar' };
      const assembler = new TestClassAssembler();
      const converted = assembler.convertToEntity(input);
      expect(converted).toBeInstanceOf(TestEntity);
      expect(plainToClassSpy).toBeCalledTimes(1);
      expect(plainToClassSpy).toBeCalledWith(TestEntity, input);
    });
  });

  describe('convertQuery', () => {
    it('should call plainToClass with the DTO class and the passed in entity', () => {
      const input = { filter: { firstName: { eq: 'foo' } } };
      const assembler = new TestClassAssembler();
      const converted = assembler.convertQuery(input);
      expect(converted).toBe(input);
      expect(plainToClassSpy).not.toBeCalled();
    });
  });
});
