import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

/** @internal */
@ValidatorConstraint({ async: false })
export class CannotUseWithout implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  validate(value: any, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>
    const required = args.constraints[0] as string
    return object[required] !== undefined
  }

  defaultMessage(args: ValidationArguments): string {
    return `Cannot be used without \`${args.constraints[0] as string}\`.`
  }
}
