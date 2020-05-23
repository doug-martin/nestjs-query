import * as nestjsCommon from '@nestjs/common';
import { Assembler, AssemblerFactory, ClassTransformerAssembler, DefaultAssembler } from '../../src';
import { getCoreMetadataStorage } from '../../src/metadata';

class TestFrom {
  first!: string;

  last!: string;
}

class TestTo {
  firstName!: string;

  lastName!: string;
}

describe('@Assembler', () => {
  const injectableSpy = jest.spyOn(nestjsCommon, 'Injectable');

  beforeEach(() => getCoreMetadataStorage().clear());
  afterAll(() => getCoreMetadataStorage().clear());

  it('should register an assembler as injectable and with metadata', () => {
    @Assembler(TestFrom, TestTo)
    class TestAssembler extends ClassTransformerAssembler<TestFrom, TestTo> {
      toPlain(dtoOrEntity: TestFrom | TestTo): object {
        return dtoOrEntity;
      }
    }
    expect(injectableSpy).toHaveBeenCalledTimes(1);
    expect(AssemblerFactory.getAssembler(TestFrom, TestTo)).toBeInstanceOf(TestAssembler);
    expect(AssemblerFactory.getAssembler(TestTo, TestFrom)).toBeInstanceOf(DefaultAssembler);
  });

  it('should throw an error when registering an assembler for the same From To combo', () => {
    @Assembler(TestFrom, TestTo)
    class TestAssembler extends ClassTransformerAssembler<TestFrom, TestTo> {
      toPlain(dtoOrEntity: TestFrom | TestTo): object {
        return dtoOrEntity;
      }
    }
    expect(() => Assembler(TestFrom, TestTo)(TestAssembler)).toThrow(
      'Assembler already registered for TestFrom TestTo',
    );
  });
});
