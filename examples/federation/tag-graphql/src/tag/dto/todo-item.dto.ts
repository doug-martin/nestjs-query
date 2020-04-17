import { ObjectType, Directive, Field, ID } from '@nestjs/graphql';

@ObjectType('TodoItem')
@Directive('@extends')
@Directive('@key(fields: "id")')
export class TodoItemDTO {
  @Field(() => ID)
  @Directive('@external')
  id!: number;
}
