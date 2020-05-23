import { Assembler, AssemblerSerializer, AssemblerDeserializer } from '../assemblers';
import { Class } from '../common';

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

  private readonly assemblerSerializers: Map<Class<unknown>, AssemblerSerializer<unknown>>;

  private readonly assemblerDeserializers: Map<Class<unknown>, AssemblerDeserializer<unknown>>;

  constructor() {
    this.assemblers = new Map<string, Class<Assembler<unknown, unknown>>>();
    this.assemblersToClasses = new Map<Class<Assembler<unknown, unknown>>, AssemblerClasses<unknown, unknown>>();
    this.assemblerSerializers = new Map<Class<unknown>, AssemblerSerializer<unknown>>();
    this.assemblerDeserializers = new Map<Class<unknown>, AssemblerDeserializer<unknown>>();
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

  getAssemblerSerializer<T>(TypeClass: Class<T>): AssemblerSerializer<T> | undefined {
    return this.assemblerSerializers.get(TypeClass);
  }

  hasAssemblerSerializer<T>(TypeClass: Class<T>): boolean {
    return this.assemblerSerializers.has(TypeClass);
  }

  addAssemblerSerializer<T>(TypeClass: Class<T>, serializer: AssemblerSerializer<T>): void {
    this.assemblerSerializers.set(TypeClass, serializer as AssemblerSerializer<unknown>);
  }

  getAssemblerDeserializer<T>(TypeClass: Class<T>): AssemblerDeserializer<T> | undefined {
    const deserializer = this.assemblerDeserializers.get(TypeClass);
    if (deserializer) {
      return deserializer as AssemblerDeserializer<T>;
    }
    return deserializer;
  }

  hasAssemblerDeserializer<T>(TypeClass: Class<T>): boolean {
    return this.assemblerDeserializers.has(TypeClass);
  }

  addAssemblerDeserializer<T>(TypeClass: Class<T>, serializer: AssemblerDeserializer<T>): void {
    this.assemblerDeserializers.set(TypeClass, serializer as AssemblerDeserializer<unknown>);
  }

  clear(): void {
    this.assemblers.clear();
    this.assemblersToClasses.clear();
  }

  private static createKey(cls1: Class<unknown>, cls2: Class<unknown>): string {
    return `${cls1.name}-${cls2.name}`;
  }
}
