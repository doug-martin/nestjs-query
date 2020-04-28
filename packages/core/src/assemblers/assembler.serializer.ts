import { Class } from '../common';
import { getCoreMetadataStorage } from '../metadata';

export type AssemblerSerializer<T> = (instance: T) => object;
export function AssemblerSerializer<T>(serializer: AssemblerSerializer<T>) {
  return <Cls extends Class<T>>(cls: Cls): Cls | void => {
    if (getCoreMetadataStorage().hasAssemblerSerializer(cls)) {
      throw new Error(`Assembler Serializer already registered for ${cls.name}`);
    }
    getCoreMetadataStorage().addAssemblerSerializer(cls, serializer);
    return cls;
  };
}
