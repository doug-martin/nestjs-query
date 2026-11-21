import { Class } from '@nestjs-query/core';

export type TypedClassDecorator<Entity> = <Cls extends Class<Entity>>(DTOClass: Cls) => Cls | void;
