import { Assembler, AssemblerService, ClassTransformerAssembler, DefaultAssembler } from '../../src';

describe('AssemblerService', () => {
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
      const assemblerService = AssemblerService.getInstance();
      expect(assemblerService.getAssembler(TestDTO, TestEntity)).toBeInstanceOf(TestAssembler);
    });

    it('should return a default assembler if an assembler for the classes is not found', () => {
      const assemblerService = AssemblerService.getInstance();
      expect(assemblerService.getAssembler(TestDTO, TestDTO)).toBeInstanceOf(DefaultAssembler);
    });
  });
});
