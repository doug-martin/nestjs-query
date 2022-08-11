import { ValidateIf, ValidationOptions } from 'class-validator'

/** @internal */
export function IsUndefined(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (obj: Object, property: string) =>
    ValidateIf((o: Record<string, unknown>) => o[property] !== undefined, validationOptions)(obj, property)
}
