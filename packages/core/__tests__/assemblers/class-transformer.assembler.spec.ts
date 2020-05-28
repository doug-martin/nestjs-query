// eslint-disable-next-line max-classes-per-file
import * as classTransformer from 'class-transformer';
import { Assembler, AssemblerDeserializer, AssemblerSerializer, ClassTransformerAssembler } from '../../src';

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
      expect(plainToClassSpy).toHaveBeenCalledTimes(1);
      expect(plainToClassSpy).toHaveBeenCalledWith(TestDTO, input);
    });
  });

  describe('convertToEntity', () => {
    it('should call plainToClass with the Entity class and the passed in dto', () => {
      const input = { firstName: 'foo', lastName: 'bar' };
      const assembler = new TestClassAssembler();
      const converted = assembler.convertToEntity(input);
      expect(converted).toBeInstanceOf(TestEntity);
      expect(plainToClassSpy).toHaveBeenCalledTimes(1);
      expect(plainToClassSpy).toHaveBeenCalledWith(TestEntity, input);
    });
  });

  describe('convertQuery', () => {
    it('should call plainToClass with the DTO class and the passed in entity', () => {
      const input = { filter: { firstName: { eq: 'foo' } } };
      const assembler = new TestClassAssembler();
      const converted = assembler.convertQuery(input);
      expect(converted).toBe(input);
      expect(plainToClassSpy).not.toHaveBeenCalled();
    });
  });

  describe('with serializer', () => {
    const testDtoSerialize = jest.fn((td: TestSerializeDTO) => ({ firstName: td.firstName, lastName: td.lastName }));
    const testEntitySerialize = jest.fn((te: TestSerializeEntity) => ({
      firstName: te.firstName,
      lastName: te.lastName,
    }));

    @AssemblerSerializer(testDtoSerialize)
    class TestSerializeDTO {
      firstName!: string;

      lastName!: string;
    }

    @AssemblerSerializer(testEntitySerialize)
    class TestSerializeEntity {
      firstName!: string;

      lastName!: string;
    }

    @Assembler(TestSerializeDTO, TestSerializeEntity)
    class TestSerializeClassAssembler extends ClassTransformerAssembler<TestSerializeDTO, TestSerializeEntity> {}

    it('should use a serializer to convert to the DTO plain object', () => {
      const input = new TestSerializeEntity();
      input.firstName = 'foo';
      input.lastName = 'bar';
      const assembler = new TestSerializeClassAssembler();
      const converted = assembler.convertToDTO(input);
      expect(testEntitySerialize).toHaveBeenCalledWith(input);
      expect(converted).toBeInstanceOf(TestSerializeDTO);
      expect(plainToClassSpy).toHaveBeenCalledTimes(1);
      expect(plainToClassSpy).toHaveBeenCalledWith(TestSerializeDTO, input);
    });

    it('should use a serializer to convert to the entity plain object', () => {
      const input = new TestSerializeDTO();
      input.firstName = 'foo';
      input.lastName = 'bar';
      const assembler = new TestSerializeClassAssembler();
      const converted = assembler.convertToEntity(input);
      expect(testDtoSerialize).toHaveBeenCalledWith(input);
      expect(converted).toBeInstanceOf(TestSerializeEntity);
      expect(plainToClassSpy).toHaveBeenCalledTimes(1);
      expect(plainToClassSpy).toHaveBeenCalledWith(TestSerializeEntity, input);
    });
  });

  describe('with deserializer', () => {
    const testDtoDeserialize = jest.fn((td) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const input = new TestDeserializeDTO();
      // @ts-ignore
      input.firstName = td.foo;
      // @ts-ignore
      input.lastName = td.bar;
      return input;
    });

    const testEntityDserialize = jest.fn((te) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const input = new TestDeserializeEntity();
      // @ts-ignore
      input.firstName = te.foo;
      // @ts-ignore
      input.lastName = te.bar;
      return input;
    });

    @AssemblerDeserializer(testDtoDeserialize)
    class TestDeserializeDTO {
      firstName!: string;

      lastName!: string;
    }

    @AssemblerDeserializer(testEntityDserialize)
    class TestDeserializeEntity {
      firstName!: string;

      lastName!: string;
    }

    @Assembler(TestDeserializeDTO, TestDeserializeEntity)
    class TestDesrializeClassAssembler extends ClassTransformerAssembler<TestDeserializeDTO, TestDeserializeEntity> {}

    it('should use a serializer to convert to the DTO plain object', () => {
      const input = new TestDeserializeEntity();
      input.firstName = 'foo';
      input.lastName = 'bar';
      const assembler = new TestDesrializeClassAssembler();
      const converted = assembler.convertToDTO(input);
      expect(testDtoDeserialize).toHaveBeenCalledWith(input);
      expect(converted).toBeInstanceOf(TestDeserializeDTO);
      expect(plainToClassSpy).toHaveBeenCalledTimes(0);
    });

    it('should use a serializer to convert to the entity plain object', () => {
      const input = new TestDeserializeDTO();
      input.firstName = 'foo';
      input.lastName = 'bar';
      const assembler = new TestDesrializeClassAssembler();
      const converted = assembler.convertToEntity(input);
      expect(converted).toBeInstanceOf(TestDeserializeEntity);
      expect(testEntityDserialize).toHaveBeenCalledWith(input);
      expect(plainToClassSpy).toHaveBeenCalledTimes(0);
    });
  });
});
