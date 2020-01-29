import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

/** @internal */
@ValidatorConstraint({ async: false })
export class PropertyMax<T> implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any, args: ValidationArguments): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const object = args.object as any;
    const field = args.constraints[0] as string;
    const maxVal = args.constraints[1] as number;
    const prop = object[args.property] ?? {};
    return prop[field] !== undefined ? prop[field] <= maxVal : true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Field ${args.property}.${args.constraints[0]} max allowed value is \`${args.constraints[1]}\`.`;
  }
}
