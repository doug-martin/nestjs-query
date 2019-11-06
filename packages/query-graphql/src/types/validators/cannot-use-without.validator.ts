import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class CannotUseWithout implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any, args: ValidationArguments): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const object = args.object as any;
    const required = args.constraints[0] as string;
    return object[required] !== undefined;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Cannot be used without \`${args.constraints[0]}\`.`;
  }
}
