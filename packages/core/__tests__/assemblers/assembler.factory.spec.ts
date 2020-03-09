import { Assembler, AssemblerFactory, ClassTransformerAssembler, DefaultAssembler } from '../../src';

describe('AssemblerFactory', () => {
  class TestDTO {
    foo!: string;
  }

  class TestEntity {
    foo!: string;
  }

  @Assembler(TestDTO, TestEntity)
  class TestAssembler extends ClassTransformerAssembler<TestDTO, TestEntity> {}

  describe('#getAssembler', () => {
    it('should return the correct assembler based on the classes', () => {
      expect(AssemblerFactory.getAssembler(TestDTO, TestEntity)).toBeInstanceOf(TestAssembler);
    });

    it('should return a default assembler if an assembler for the classes is not found', () => {
      expect(AssemblerFactory.getAssembler(TestDTO, TestDTO)).toBeInstanceOf(DefaultAssembler);
    });
  });
});
