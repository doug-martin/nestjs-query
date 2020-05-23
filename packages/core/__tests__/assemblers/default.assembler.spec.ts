import * as classTransformer from 'class-transformer';
import { DefaultAssembler } from '../../src';

describe('DefaultAssembler', () => {
  const plainToClassSpy = jest.spyOn(classTransformer, 'plainToClass');

  class TestDTO {
    firstName!: string;

    lastName!: string;
  }

  class TestEntity {
    firstName!: string;

    lastName!: string;
  }

  beforeEach(() => jest.clearAllMocks());

  describe('convertToDTO', () => {
    it('should call plainToClass with the DTO class and the passed in entity', () => {
      const input = { firstName: 'foo', lastName: 'bar' };
      const assembler = new DefaultAssembler(TestDTO, TestEntity);
      const converted = assembler.convertToDTO(input);
      expect(converted).toBeInstanceOf(TestDTO);
      expect(plainToClassSpy).toHaveBeenCalledTimes(1);
      expect(plainToClassSpy).toHaveBeenCalledWith(TestDTO, input);
    });
  });

  describe('convertToEntity', () => {
    it('should call plainToClass with the Entity class and the passed in dto', () => {
      const input = { firstName: 'foo', lastName: 'bar' };
      const assembler = new DefaultAssembler(TestDTO, TestEntity);
      const converted = assembler.convertToEntity(input);
      expect(converted).toBeInstanceOf(TestEntity);
      expect(plainToClassSpy).toHaveBeenCalledTimes(1);
      expect(plainToClassSpy).toHaveBeenCalledWith(TestEntity, input);
    });
  });

  describe('convertQuery', () => {
    it('should call plainToClass with the DTO class and the passed in entity', () => {
      const input = { filter: { firstName: { eq: 'foo' } } };
      const assembler = new DefaultAssembler(TestDTO, TestEntity);
      const converted = assembler.convertQuery(input);
      expect(converted).toBe(input);
      expect(plainToClassSpy).not.toHaveBeenCalled();
    });
  });
});
