import { Class, MetaValue, ValueReflector } from '../common'
import { ASSEMBLER_SERIALIZER_KEY } from './constants'

const reflector = new ValueReflector(ASSEMBLER_SERIALIZER_KEY)
// eslint-disable-next-line @typescript-eslint/ban-types
export type AssemblerSerializer<T> = (instance: T) => object

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function AssemblerSerializer<T>(serializer: AssemblerSerializer<T>) {
  return <Cls extends Class<T>>(cls: Cls): Cls | void => {
    if (reflector.isDefined(cls)) {
      throw new Error(`Assembler Serializer already registered for ${cls.name}`)
    }
    reflector.set(cls, serializer)
    return cls
  }
}

export function getAssemblerSerializer<DTO>(DTOClass: Class<DTO>): MetaValue<AssemblerSerializer<DTO>> {
  return reflector.get(DTOClass, true)
}
