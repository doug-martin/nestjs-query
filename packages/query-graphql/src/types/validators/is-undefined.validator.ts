import { ValidationOptions, ValidateIf } from 'class-validator';

/** @internal */
export function IsUndefined(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (obj: any, property: string) => ValidateIf(o => o[property] !== undefined, validationOptions)(obj, property);
}
