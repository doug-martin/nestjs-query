import { plural } from 'pluralize';
import { lowerCaseFirst } from 'change-case';
import { Class, DeepPartial } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ArgumentValidationError } from 'type-graphql';
import { getMetadataStorage } from '../metadata';

type DTONamesOpts = {
  dtoName?: string;
};

type DTONames = {
  baseName: string;
  baseNameLower: string;
  pluralBaseName: string;
  pluralBaseNameLower: string;
};

export const getDTONames = <DTO>(opts: DTONamesOpts, DTOClass: Class<DTO>): DTONames => {
  const baseName = opts.dtoName ?? getMetadataStorage().getTypeGraphqlObjectMetadata(DTOClass)?.name ?? DTOClass.name;
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

export const transformAndValidate = async <T>(TClass: Class<T>, partial: DeepPartial<T>): Promise<T> => {
  if (partial instanceof TClass) {
    return partial;
  }
  const transformed = plainToClass(TClass, partial);
  const validationErrors = await validate(transformed, {});
  if (validationErrors.length) {
    throw new ArgumentValidationError(validationErrors);
  }
  return transformed;
};
