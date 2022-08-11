import { Assembler } from '../assemblers'
import { Class } from '../common'

export function getQueryServiceToken(DTOClass: { name: string }): string {
  return `${DTOClass.name}QueryService`
}

export function getAssemblerQueryServiceToken<DTO, Entity = unknown>(
  AssemblerClass: Class<Assembler<DTO, Entity, unknown, unknown, unknown, unknown>>
): string {
  return `${AssemblerClass.name}QueryService`
}
