import * as nestjsCommon from '@nestjs/common';
import { Assembler, ClassTransformerAssembler, getAssembler } from '../../src';
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
    class TestAssembler extends ClassTransformerAssembler<TestFrom, TestTo> {}
    expect(injectableSpy).toBeCalledTimes(1);
    expect(getAssembler(TestFrom, TestTo)).toBe(TestAssembler);
    expect(getAssembler(TestTo, TestFrom)).toBe(undefined);
  });

  it('should throw an error when registering an assembler for the same From To combo', () => {
    @Assembler(TestFrom, TestTo)
    class TestAssembler extends ClassTransformerAssembler<TestFrom, TestTo> {}
    expect(() => Assembler(TestFrom, TestTo)(TestAssembler)).toThrowError(
      'Assembler already registered for TestFrom TestTo',
    );
  });
});
