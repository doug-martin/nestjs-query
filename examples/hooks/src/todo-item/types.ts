import { MutationArgsType, UpdateManyInputType } from '@nestjs-query/query-graphql';
import { ArgsType, InputType } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';

@InputType()
class UpdateManyTodoItemsInput extends UpdateManyInputType(TodoItemDTO, TodoItemUpdateDTO) {}

@ArgsType()
export class UpdateManyTodoItemsArgs extends MutationArgsType(UpdateManyTodoItemsInput) {}
