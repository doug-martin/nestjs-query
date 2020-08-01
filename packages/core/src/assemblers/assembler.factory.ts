import { Class } from '../common';
import { Assembler, getAssembler } from './assembler';
import { DefaultAssembler } from './default.assembler';

/**
 * Assembler Service used by query services to look up Assemblers.
 */
export class AssemblerFactory {
  static getAssembler<From, To>(FromClass: Class<From>, ToClass: Class<To>): Assembler<From, To> {
    const AssemblerClass = getAssembler(FromClass, ToClass);
    if (AssemblerClass) {
      return new AssemblerClass();
    }
    return new DefaultAssembler(FromClass, ToClass);
  }
}
