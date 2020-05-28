import { Class } from '../common';
import { getCoreMetadataStorage } from '../metadata';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AssemblerDeserializer<T> = (obj: object) => T;

export function AssemblerDeserializer<T>(deserializer: AssemblerDeserializer<T>) {
  return <Cls extends Class<T>>(cls: Cls): Cls | void => {
    if (getCoreMetadataStorage().hasAssemblerDeserializer(cls)) {
      throw new Error(`Assembler Deserializer already registered for ${cls.name}`);
    }
    getCoreMetadataStorage().addAssemblerDeserializer(cls, deserializer);
    return cls;
  };
}
