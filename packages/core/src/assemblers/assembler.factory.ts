import { Class, DeepPartial } from '../common';
import { Assembler, getAssemblers } from './assembler';
import { DefaultAssembler } from './default.assembler';

/**
 * Assembler Service used by query services to look up Assemblers.
 */
export class AssemblerFactory {
  static getAssembler<DTO, Entity, C = DeepPartial<DTO>, CE = DeepPartial<Entity>, U = C, UE = CE>(
    DTOClass: Class<DTO>,
    EntityClass: Class<Entity>,
  ): Assembler<DTO, Entity, C, CE, U, UE> {
    const AssemblerClasses = getAssemblers(DTOClass);
    if (AssemblerClasses) {
      const AssemblerClass = AssemblerClasses.get(EntityClass);
      if (AssemblerClass) {
        return new AssemblerClass() as Assembler<DTO, Entity, C, CE, U, UE>;
      }
      const keys = [...AssemblerClasses.keys()];
      const keysWithParent = keys.filter((k) => k.prototype instanceof EntityClass);
      if (keysWithParent.length === 1) {
        return this.getAssembler(DTOClass, keysWithParent[0] as Class<Entity>);
      }
    }
    const defaultAssembler = new DefaultAssembler(DTOClass, EntityClass);
    // if its a default just assume the types can be converted for all types
    return defaultAssembler as unknown as Assembler<DTO, Entity, C, CE, U, UE>;
  }
}
