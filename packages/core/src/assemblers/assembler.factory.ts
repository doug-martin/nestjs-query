import { Class, DeepPartial } from '../common';
import { Assembler, getAssembler } from './assembler';
import { DefaultAssembler } from './default.assembler';

/**
 * Assembler Service used by query services to look up Assemblers.
 */
export class AssemblerFactory {
  static getAssembler<From, To, C = DeepPartial<From>, CE = DeepPartial<To>, U = C, UE = CE>(
    FromClass: Class<From>,
    ToClass: Class<To>,
  ): Assembler<From, To, C, CE, U, UE> {
    const AssemblerClass = getAssembler<From, To, C, CE, U, UE>(FromClass, ToClass);
    if (AssemblerClass) {
      return new AssemblerClass();
    }
    const defaultAssember = new DefaultAssembler(FromClass, ToClass);
    // if its a default just assume the types can be converted for all types
    return (defaultAssember as unknown) as Assembler<From, To, C, CE, U, UE>;
  }
}
