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
      expect(testEntitySerialize).toBeCalledWith(input);
      expect(converted).toBeInstanceOf(TestSerializeDTO);
      expect(plainToClassSpy).toBeCalledTimes(1);
      expect(plainToClassSpy).toBeCalledWith(TestSerializeDTO, input);
    });

    it('should use a serializer to convert to the entity plain object', () => {
      const input = new TestSerializeDTO();
      input.firstName = 'foo';
      input.lastName = 'bar';
      const assembler = new TestSerializeClassAssembler();
      const converted = assembler.convertToEntity(input);
      expect(testDtoSerialize).toBeCalledWith(input);
      expect(converted).toBeInstanceOf(TestSerializeEntity);
      expect(plainToClassSpy).toBeCalledTimes(1);
      expect(plainToClassSpy).toBeCalledWith(TestSerializeEntity, input);
    });
  });

  describe('with deserializer', () => {
    const testDtoDeserialize = jest.fn((td: object) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const input = new TestDeserializeDTO();
      // @ts-ignore
      input.firstName = td.foo;
      // @ts-ignore
      input.lastName = td.bar;
      return input;
    });

    const testEntityDserialize = jest.fn((te: object) => {
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
      expect(testDtoDeserialize).toBeCalledWith(input);
      expect(converted).toBeInstanceOf(TestDeserializeDTO);
      expect(plainToClassSpy).toBeCalledTimes(0);
    });

    it('should use a serializer to convert to the entity plain object', () => {
      const input = new TestDeserializeDTO();
      input.firstName = 'foo';
      input.lastName = 'bar';
      const assembler = new TestDesrializeClassAssembler();
      const converted = assembler.convertToEntity(input);
      expect(converted).toBeInstanceOf(TestDeserializeEntity);
      expect(testEntityDserialize).toBeCalledWith(input);
      expect(plainToClassSpy).toBeCalledTimes(0);
    });
  });
});
