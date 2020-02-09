import { Class } from '../common';
import { getCoreMetadataStorage } from '../metadata';
import { Assembler } from './assembler';

export { ClassTransformerAssembler } from './class-transformer.assembler';
export { DefaultAssembler } from './default.assembler';
export { AbstractAssembler } from './abstract.assembler';
export { Assembler } from './assembler';

export const getAssembler = <From, To>(
  FromClass: Class<From>,
  ToClass: Class<To>,
): Class<Assembler<From, To>> | undefined => {
  return getCoreMetadataStorage().getAssembler(FromClass, ToClass);
};
