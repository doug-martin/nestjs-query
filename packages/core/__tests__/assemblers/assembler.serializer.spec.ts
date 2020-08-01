import { getAssemblerSerializer } from '../../src/assemblers/assembler.serializer';
import { AssemblerSerializer } from '../../src';

describe('AssemblerSerializer decorator', () => {
  it('should register a serializer', () => {
    @AssemblerSerializer((t: TestSerializer) => ({ bar: t.foo }))
    class TestSerializer {
      foo!: string;
    }

    expect(getAssemblerSerializer(TestSerializer)!({ foo: 'bar' })).toEqual({ bar: 'bar' });
  });

  it('should throw an error if the serializer is registered twice', () => {
    const serializer = (t: TestSerializer) => ({ bar: t.foo });
    @AssemblerSerializer(serializer)
    class TestSerializer {
      foo!: string;
    }

    expect(() => AssemblerSerializer(serializer)(TestSerializer)).toThrow(
      'Assembler Serializer already registered for TestSerializer',
    );
  });
});
