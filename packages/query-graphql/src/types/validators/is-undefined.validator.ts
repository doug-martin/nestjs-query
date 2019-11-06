import { ValidationOptions, ValidateIf } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IsUndefined = (validationOptions?: ValidationOptions) => (obj: any, property: string) =>
  ValidateIf(o => o[property] !== undefined, validationOptions)(obj, property);
