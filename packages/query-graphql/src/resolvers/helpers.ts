import { Class } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ArgumentValidationError } from 'type-graphql';

/** @internal */
export const transformAndValidate = async <T>(TClass: Class<T>, partial: T): Promise<T> => {
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
