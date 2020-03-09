import { Class } from '../common';
import { getCoreMetadataStorage } from '../metadata';
import { Assembler } from './assembler';
import { DefaultAssembler } from './default.assembler';

/**
 * Assembler Service used by query services to look up Assemblers.
 */
export class AssemblerFactory {
  static getAssembler<From, To>(FromClass: Class<From>, ToClass: Class<To>): Assembler<From, To> {
    const AssemblerClass = getCoreMetadataStorage().getAssembler(FromClass, ToClass);
    if (AssemblerClass) {
      return new AssemblerClass();
    }
    return new DefaultAssembler(FromClass, ToClass);
  }
}
