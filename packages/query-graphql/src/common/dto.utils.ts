import { Class } from '@nestjs-query/core';
import { plural } from 'pluralize';
import { upperCaseFirst } from 'upper-case-first';
import { lowerCaseFirst } from 'lower-case-first';
import { ID, ReturnTypeFuncValue } from '@nestjs/graphql';
import { findGraphqlObjectMetadata } from './external.utils';
import { getIDField } from '../decorators';

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

export const getDTOIdTypeOrDefault = (
  DTOS: Class<unknown>[],
  defaultType: ReturnTypeFuncValue = ID,
): ReturnTypeFuncValue => {
  const dtoWithIDField = DTOS.find((dto) => !!getIDField(dto));
  if (dtoWithIDField) {
    return getIDField(dtoWithIDField)?.returnTypeFunc() ?? defaultType;
  }
  return defaultType;
};
