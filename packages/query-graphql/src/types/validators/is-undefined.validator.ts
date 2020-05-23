import { ValidationOptions, ValidateIf } from 'class-validator';

/** @internal */
export function IsUndefined(validationOptions?: ValidationOptions) {
  return (obj: any, property: string) =>
    ValidateIf((o: Record<string, unknown>) => o[property] !== undefined, validationOptions)(obj, property);
}
