import { Class } from '@nestjs-query/core';

export class UnregisteredObjectType<T> extends Error {
  constructor(Cls: Class<T>, description: string) {
    super(`${description} Ensure ${Cls.name} is annotated with type-graphql @ObjectType`);
  }
}
