import { Assembler } from '../assemblers';
import { Class } from '../common';

export function getQueryServiceToken<DTO>(DTOClass: Class<DTO>): string {
  return `${DTOClass.name}QueryService`;
}

export function getAssemblerQueryServiceToken<DTO, Entity = unknown>(
  AssemblerClass: Class<Assembler<DTO, Entity>>,
): string {
  return `${AssemblerClass.name}QueryService`;
}
