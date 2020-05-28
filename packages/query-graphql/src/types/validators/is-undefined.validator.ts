import { ValidationOptions, ValidateIf } from 'class-validator';

/** @internal */
export function IsUndefined(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  return (obj: any, property: string) =>
    ValidateIf((o: Record<string, unknown>) => o[property] !== undefined, validationOptions)(obj, property);
}
