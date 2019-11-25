import { ValidationOptions, ValidateIf } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IsUndefined(validationOptions?: ValidationOptions) {
  return (obj: any, property: string) => ValidateIf(o => o[property] !== undefined, validationOptions)(obj, property);
}
