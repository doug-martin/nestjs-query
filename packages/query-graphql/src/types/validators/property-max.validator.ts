import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

/** @internal */
@ValidatorConstraint({ async: false })
export class PropertyMax implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  validate(value: any, args: ValidationArguments): boolean {
    const maxVal = args.constraints[1] as number
    if (maxVal === -1) {
      return true
    }
    const field = args.constraints[0] as string
    const object = args.object as Record<string, Record<string, number>>
    const prop = object[args.property] ?? {}
    if (prop[field] === undefined) {
      return true
    }
    return prop[field] <= maxVal
  }

  defaultMessage(args: ValidationArguments): string {
    return `Field ${args.property}.${args.constraints[0] as number} max allowed value is \`${args.constraints[1] as number}\`.`
  }
}
