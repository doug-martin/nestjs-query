import { Class } from '../common';
import { ClassTransformerAssembler } from './class-transformer.assembler';

/**
 * DefaultAssembler used when an Assembler was not defined.
 */
export class DefaultAssembler<DTO, Entity> extends ClassTransformerAssembler<DTO, Entity> {
  constructor(DTOClass: Class<DTO>, EntityClass: Class<Entity>) {
    super(DTOClass, EntityClass);
  }
}
