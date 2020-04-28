import { AssemblerDeserializer } from '../../src/assemblers';
import { getCoreMetadataStorage } from '../../src/metadata';

describe('AssemblerDeserializer decorator', () => {
  it('should register a serializer', () => {
    // @ts-ignore
    @AssemblerDeserializer((obj: object): TestSerializer => ({ foo: obj.bar }))
    class TestSerializer {
      foo!: string;
    }

    expect(getCoreMetadataStorage().getAssemblerDeserializer(TestSerializer)!({ bar: 'bar' })).toEqual({ foo: 'bar' });
  });

  it('should throw an error if the serializer is registered twice', () => {
    // @ts-ignore
    const deserializer = (obj: object): TestSerializer => ({ foo: obj.bar });
    @AssemblerDeserializer(deserializer)
    class TestSerializer {
      foo!: string;
    }

    expect(() => AssemblerDeserializer(deserializer)(TestSerializer)).toThrow(
      'Assembler Deserializer already registered for TestSerializer',
    );
  });
});
