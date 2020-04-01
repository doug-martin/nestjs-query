import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

/** @internal */
@ValidatorConstraint({ async: false })
export class CannotUseWith implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any, args: ValidationArguments): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const object = args.object as any;
    return args.constraints.every((propertyName) => object[propertyName] === undefined);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Cannot be used with \`${args.constraints.join('` , `')}\`.`;
  }
}
