import { Provider } from '@nestjs/common';
import { Assembler, getAssemblerClasses } from './assemblers';
import { Class, DeepPartial } from './common';
import { getQueryServiceToken } from './decorators';
import { getAssemblerQueryServiceToken } from './decorators/helpers';
import { AssemblerQueryService, QueryService } from './services';

function createServiceProvider<DTO, Entity>(AssemblerClass: Class<Assembler<DTO, Entity>>): Provider {
  const classes = getAssemblerClasses(AssemblerClass);
  if (!classes) {
    throw new Error(
      `unable to determine DTO and Entity classes for ${AssemblerClass.name}. Did you decorate your class with @Assembler`,
    );
  }
  const { EntityClass } = classes;
  return {
    provide: getAssemblerQueryServiceToken(AssemblerClass),
    useFactory(
      assembler: Assembler<DTO, Entity>,
      entityService: QueryService<Entity, DeepPartial<Entity>, DeepPartial<Entity>>,
    ) {
      return new AssemblerQueryService(assembler, entityService);
    },
    inject: [AssemblerClass, getQueryServiceToken(EntityClass)],
  };
}

export const createServices = (opts: Class<Assembler<unknown, unknown>>[]): Provider[] => {
  return opts.map((opt) => createServiceProvider(opt));
};
