import { Class, DeepPartial } from '../common'
import { ClassTransformerAssembler } from './class-transformer.assembler'

/**
 * DefaultAssembler used when an Assembler was not defined.
 */
export class DefaultAssembler<DTO, Entity extends DeepPartial<Entity>> extends ClassTransformerAssembler<DTO, Entity> {
  constructor(DTOClass: Class<DTO>, EntityClass: Class<Entity>) {
    super(DTOClass, EntityClass)
  }
}
