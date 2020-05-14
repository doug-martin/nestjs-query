import { Inject } from '@nestjs/common';
import { Assembler } from '../assemblers';
import { Class } from '../common';
import { getAssemblerQueryServiceToken } from './helpers';

export const InjectAssemblerQueryService = <DTO, Entity>(
  AssemblerClass: Class<Assembler<DTO, Entity>>,
): ParameterDecorator => Inject(getAssemblerQueryServiceToken(AssemblerClass));
