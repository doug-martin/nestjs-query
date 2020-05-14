import { DynamicModule, ForwardReference } from '@nestjs/common';
import { Assembler } from './assemblers';
import { Class } from './common';
import { createServices } from './providers';

export interface NestjsQueryCoreModuleOpts {
  imports?: Array<Class<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  assemblers?: Class<Assembler<any, any>>[];
}

export class NestjsQueryCoreModule {
  static forFeature(opts: NestjsQueryCoreModuleOpts): DynamicModule {
    const { imports = [], assemblers = [] } = opts;
    const assemblerServiceProviders = createServices(assemblers);
    return {
      module: NestjsQueryCoreModule,
      imports: [...imports],
      providers: [...assemblers, ...assemblerServiceProviders],
      exports: [...imports, ...assemblers, ...assemblerServiceProviders],
    };
  }
}
