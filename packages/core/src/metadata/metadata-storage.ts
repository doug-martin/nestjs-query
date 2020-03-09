import { Class } from '../common';
import { Assembler } from '../assemblers';

export interface AssemblerClasses<DTO, Entity> {
  DTOClass: Class<DTO>;
  EntityClass: Class<Entity>;
}
/**
 * @internal
 */
export class CoreQueryMetadataStorage {
  private readonly assemblers: Map<string, Class<Assembler<unknown, unknown>>>;

  private readonly assemblersToClasses: Map<Class<Assembler<unknown, unknown>>, AssemblerClasses<unknown, unknown>>;

  constructor() {
    this.assemblers = new Map();
    this.assemblersToClasses = new Map();
  }

  getAssembler<DTO, Entity>(
    DTOClass: Class<DTO>,
    EntityClass: Class<Entity>,
  ): Class<Assembler<DTO, Entity>> | undefined {
    const assembler = this.assemblers.get(CoreQueryMetadataStorage.createKey(DTOClass, EntityClass));
    if (assembler) {
      return assembler as Class<Assembler<DTO, Entity>>;
    }
    return undefined;
  }

  getAssemblerClasses<DTO, Entity>(
    AssemblerClass: Class<Assembler<DTO, Entity>>,
  ): AssemblerClasses<DTO, Entity> | undefined {
    const assemblerClasses = this.assemblersToClasses.get(AssemblerClass as Class<Assembler<unknown, unknown>>);
    if (assemblerClasses) {
      return assemblerClasses as AssemblerClasses<DTO, Entity>;
    }
    return undefined;
  }

  hasAssembler<DTO, Entity>(DTOClass: Class<DTO>, EntityClass: Class<Entity>): boolean {
    return this.assemblers.has(CoreQueryMetadataStorage.createKey(DTOClass, EntityClass));
  }

  addAssembler<DTO, Entity>(
    DTOClass: Class<DTO>,
    EntityClass: Class<Entity>,
    assembler: Class<Assembler<DTO, Entity>>,
  ): void {
    this.assemblers.set(
      CoreQueryMetadataStorage.createKey(DTOClass, EntityClass),
      assembler as Class<Assembler<unknown, unknown>>,
    );
    this.assemblersToClasses.set(assembler as Class<Assembler<unknown, unknown>>, { DTOClass, EntityClass });
  }

  clear(): void {
    this.assemblers.clear();
    this.assemblersToClasses.clear();
  }

  private static createKey(cls1: Class<unknown>, cls2: Class<unknown>): string {
    return `${cls1.name}-${cls2.name}`;
  }
}
