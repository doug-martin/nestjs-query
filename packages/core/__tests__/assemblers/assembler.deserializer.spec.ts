import { getAssemblerDeserializer } from '../../src/assemblers/assembler.deserializer';
import { AssemblerDeserializer } from '../../src';

describe('AssemblerDeserializer decorator', () => {
  it('should register a serializer', () => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/ban-types
    @AssemblerDeserializer((obj: object): TestSerializer => ({ foo: obj.bar }))
    class TestSerializer {
      foo!: string;
    }

    expect(getAssemblerDeserializer(TestSerializer)!({ bar: 'bar' })).toEqual({ foo: 'bar' });
  });

  it('should throw an error if the serializer is registered twice', () => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/ban-types
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
