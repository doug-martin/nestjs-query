/**
 * @internal
 * Wraps Args to allow skipping decorating
 * @param check - checker to run.
 * @param decorators - The decorators to apply
 */
export function SkipIf(
  check: () => boolean,
  ...decorators: (MethodDecorator | PropertyDecorator | ClassDecorator | ParameterDecorator)[]
): MethodDecorator & PropertyDecorator & ClassDecorator & ParameterDecorator {
  if (check()) {
    return (): void => {};
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <TFunction extends Function, Y>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: TFunction | object,
    propertyKey?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<Y> | number,
  ) => {
    decorators.forEach((decorator) => {
      if (target instanceof Function && !descriptorOrIndex) {
        return (decorator as ClassDecorator)(target);
      }
      if (typeof descriptorOrIndex === 'number') {
        return (decorator as ParameterDecorator)(target, propertyKey as string | symbol, descriptorOrIndex);
      }
      return (decorator as MethodDecorator | PropertyDecorator)(
        target,
        propertyKey as string | symbol,
        descriptorOrIndex as TypedPropertyDescriptor<Y>,
      );
    });
  };
}
