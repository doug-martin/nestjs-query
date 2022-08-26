import { Provider } from '@nestjs/common'

import { Assembler, getAssemblerClasses } from './assemblers'
import { Class } from './common'
import { getQueryServiceToken } from './decorators'
import { getAssemblerQueryServiceToken } from './decorators/helpers'
import { AssemblerQueryService, QueryService } from './services'

function createServiceProvider<DTO, Entity, C, CE, U, UE>(AssemblerClass: Class<Assembler<DTO, Entity, C, CE, U, UE>>): Provider {
  const classes = getAssemblerClasses(AssemblerClass)
  if (!classes) {
    throw new Error(
      `unable to determine DTO and Entity classes for ${AssemblerClass.name}. Did you decorate your class with @Assembler`
    )
  }
  const { EntityClass } = classes
  return {
    provide: getAssemblerQueryServiceToken(AssemblerClass),
    useFactory(assembler: Assembler<DTO, Entity, C, CE, U, UE>, entityService: QueryService<Entity, CE, UE>) {
      return new AssemblerQueryService(assembler, entityService)
    },
    inject: [AssemblerClass, getQueryServiceToken(EntityClass)]
  }
}

export const createServices = (opts: Class<Assembler<unknown, unknown, unknown, unknown, unknown, unknown>>[]): Provider[] =>
  opts.map((opt) => createServiceProvider(opt))
