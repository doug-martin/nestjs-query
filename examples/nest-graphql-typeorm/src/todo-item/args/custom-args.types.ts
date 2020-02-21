import { CreateOneArgsType } from '@nestjs-query/query-graphql';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ArgsType, Field } from 'type-graphql';
import { TodoItemInputDTO } from '../dto/todo-item-input.dto';

@ArgsType()
export class CreateOneTodoItemArgs extends CreateOneArgsType(TodoItemInputDTO) {
  @Type(() => TodoItemInputDTO)
  @ValidateNested()
  @Field({
    description: 'The ToDo Item to be created',
  })
  input!: TodoItemInputDTO;
}
