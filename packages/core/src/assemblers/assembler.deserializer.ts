import { Class, MetaValue, ValueReflector } from '../common'
import { ASSEMBLER_DESERIALIZER_KEY } from './constants'

const reflector = new ValueReflector(ASSEMBLER_DESERIALIZER_KEY)
// eslint-disable-next-line @typescript-eslint/ban-types
export type AssemblerDeserializer<T> = (obj: object) => T

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function AssemblerDeserializer<T>(deserializer: AssemblerDeserializer<T>) {
  return <Cls extends Class<T>>(cls: Cls): Cls | void => {
    if (reflector.isDefined(cls)) {
      throw new Error(`Assembler Deserializer already registered for ${cls.name}`)
    }
    reflector.set(cls, deserializer)
    return cls
  }
}

export function getAssemblerDeserializer<DTO>(DTOClass: Class<DTO>): MetaValue<AssemblerDeserializer<DTO>> {
  return reflector.get(DTOClass, true)
}
