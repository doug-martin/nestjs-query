import { Class } from '@nestjs-query/core';

export type ComposableDecorator = MethodDecorator | PropertyDecorator | ClassDecorator | ParameterDecorator;
export type ComposedDecorator = MethodDecorator & PropertyDecorator & ClassDecorator & ParameterDecorator;

export function composeDecorators(...decorators: ComposableDecorator[]): ComposedDecorator {
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

type ClassDecoratorDataFunc<Data> = (data: Data) => ClassDecorator;
export const classMetadataDecorator = <Data>(key: string): ClassDecoratorDataFunc<Data> => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (data: Data) => (target: Function): void => {
    Reflect.defineMetadata(key, data, target);
  };
};

export type MetaValue<MetaType> = MetaType | undefined;
export function getClassMetadata<DTO, MetaType>(DTOClass: Class<DTO>, key: string): MetaValue<MetaType> {
  return Reflect.getMetadata(key, DTOClass) as MetaValue<MetaType>;
}
