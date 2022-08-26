import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

/** @internal */
@ValidatorConstraint({ async: false })
export class CannotUseWith implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  validate(value: any, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>
    return args.constraints.every((propertyName: string) => object[propertyName] === undefined)
  }

  defaultMessage(args: ValidationArguments): string {
    return `Cannot be used with \`${args.constraints.join('` , `')}\`.`
  }
}
