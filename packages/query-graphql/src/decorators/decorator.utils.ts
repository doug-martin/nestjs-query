export type ComposableDecorator = MethodDecorator | PropertyDecorator | ClassDecorator | ParameterDecorator
export type ComposedDecorator = MethodDecorator & PropertyDecorator & ClassDecorator & ParameterDecorator

export function composeDecorators(...decorators: ComposableDecorator[]): ComposedDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <TFunction extends Function, Y>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: TFunction | object,
    propertyKey?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<Y> | number
  ) => {
    decorators.forEach((decorator) => {
      if (target instanceof Function && !descriptorOrIndex) {
        return (decorator as ClassDecorator)(target)
      }
      if (typeof descriptorOrIndex === 'number') {
        return (decorator as ParameterDecorator)(target, propertyKey, descriptorOrIndex)
      }
      return (decorator as MethodDecorator | PropertyDecorator)(target, propertyKey, descriptorOrIndex)
    })
  }
}
