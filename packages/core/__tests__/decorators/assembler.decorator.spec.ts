import { Assembler, AssemblerFactory, ClassTransformerAssembler, DefaultAssembler } from '../../src';

class TestFrom {
  first!: string;

  last!: string;
}

class TestTo {
  firstName!: string;

  lastName!: string;
}

describe('@Assembler', () => {
  it('should register an assembler with metadata', () => {
    @Assembler(TestFrom, TestTo)
    class TestAssembler extends ClassTransformerAssembler<TestFrom, TestTo> {
      toPlain(dtoOrEntity: TestFrom | TestTo) {
        return dtoOrEntity;
      }
    }
    expect(AssemblerFactory.getAssembler(TestFrom, TestTo)).toBeInstanceOf(TestAssembler);
    expect(AssemblerFactory.getAssembler(TestTo, TestFrom)).toBeInstanceOf(DefaultAssembler);
  });

  it('should throw an error when registering an assembler for the same From To combo', () => {
    class TestAssembler extends ClassTransformerAssembler<TestFrom, TestTo> {
      toPlain(dtoOrEntity: TestFrom | TestTo) {
        return dtoOrEntity;
      }
    }
    expect(() => Assembler(TestFrom, TestTo)(TestAssembler)).toThrow(
      'Assembler already registered for TestFrom TestTo',
    );
  });
});
