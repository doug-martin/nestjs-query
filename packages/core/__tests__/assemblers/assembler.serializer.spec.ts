import { AssemblerSerializer } from '../../src/assemblers';
import { getCoreMetadataStorage } from '../../src/metadata';

describe('AssemblerSerializer decorator', () => {
  it('should register a serializer', () => {
    @AssemblerSerializer((t: TestSerializer) => ({ bar: t.foo }))
    class TestSerializer {
      foo!: string;
    }

    expect(getCoreMetadataStorage().getAssemblerSerializer(TestSerializer)!({ foo: 'bar' })).toEqual({ bar: 'bar' });
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
