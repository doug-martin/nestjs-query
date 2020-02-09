import { DefaultAssembler, Assembler } from '../assemblers';
import { Class } from '../common';
import { getCoreMetadataStorage } from '../metadata';

/**
 * Assembler Service used by query services to look up Assemblers.
 */
export class AssemblerService {
  private static assemblerService: AssemblerService | undefined;

  static getInstance(): AssemblerService {
    if (!this.assemblerService) {
      this.assemblerService = new AssemblerService();
    }
    return this.assemblerService;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor() {}

  getAssembler<From, To>(FromClass: Class<From>, ToClass: Class<To>): Assembler<From, To> {
    const AssemblerClass = getCoreMetadataStorage().getAssembler(FromClass, ToClass);
    if (AssemblerClass) {
      return new AssemblerClass();
    }
    return new DefaultAssembler(FromClass, ToClass);
  }
}
