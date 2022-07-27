import { MutationArgsType, UpdateManyInputType } from '@codeshine/nestjs-query-query-graphql';
import { ArgsType, InputType, OmitType } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';

@InputType()
class MarkTodoItemAsCompleted extends OmitType(TodoItemUpdateDTO, ['completed']) {}

@InputType()
class MarkTodoItemsAsCompletedInput extends UpdateManyInputType(TodoItemDTO, MarkTodoItemAsCompleted) {}

@ArgsType()
export class MarkTodoItemsAsCompletedArgs extends MutationArgsType(MarkTodoItemsAsCompletedInput) {}
