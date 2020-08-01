import { Class } from '@nestjs-query/core';
import { plural } from 'pluralize';
import { upperCaseFirst } from 'upper-case-first';
import { lowerCaseFirst } from 'lower-case-first';
import { findGraphqlObjectMetadata } from './external.utils';

export interface DTONamesOpts {
  dtoName?: string;
}

/** @internal */
export interface DTONames {
  baseName: string;
  baseNameLower: string;
  pluralBaseName: string;
  pluralBaseNameLower: string;
}

/** @internal */
export const getDTONames = <DTO>(DTOClass: Class<DTO>, opts?: DTONamesOpts): DTONames => {
  const baseName = upperCaseFirst(opts?.dtoName ?? findGraphqlObjectMetadata(DTOClass)?.name ?? DTOClass.name);
  const pluralBaseName = plural(baseName);
  const baseNameLower = lowerCaseFirst(baseName);
  const pluralBaseNameLower = plural(baseNameLower);
  return {
    baseName,
    baseNameLower,
    pluralBaseName,
    pluralBaseNameLower,
  };
};
