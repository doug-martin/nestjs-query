import { Inject } from '@nestjs/common'

import { Assembler } from '../assemblers'
import { Class, DeepPartial } from '../common'
import { getAssemblerQueryServiceToken } from './helpers'

export const InjectAssemblerQueryService = <DTO, Entity, C = DeepPartial<DTO>, CE = DeepPartial<Entity>, U = C, UE = CE>(
  AssemblerClass: Class<Assembler<DTO, Entity, C, CE, U, UE>>
): ReturnType<typeof Inject> => Inject(getAssemblerQueryServiceToken(AssemblerClass))
