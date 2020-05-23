import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

/** @internal */
@ValidatorConstraint({ async: false })
export class CannotUseWith implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>;
    return args.constraints.every((propertyName: string) => object[propertyName] === undefined);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Cannot be used with \`${args.constraints.join('` , `')}\`.`;
  }
}
