import { NestjsQueryGraphQLModule } from '@codeshine/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@codeshine/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { TagInputDTO } from './dto/tag-input.dto';
import { TagTodoItemDTO } from './dto/tag-todo-item.dto';
import { TagTodoItemInputDTO } from './dto/tag-todo-item.input';
import { TagDTO } from './dto/tag.dto';
import { TodoItemReferenceDTO } from './dto/todo-item-reference.dto';
import { TagTodoItemEntity } from './tag-todo-item.entity';
import { TagEntity } from './tag.entity';
import { TodoItemService } from './todo-item.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([TagEntity, TagTodoItemEntity])],
      services: [TodoItemService],
      resolvers: [
        {
          DTOClass: TagDTO,
          EntityClass: TagEntity,
          CreateDTOClass: TagInputDTO,
          UpdateDTOClass: TagInputDTO,
        },
        {
          DTOClass: TagTodoItemDTO,
          EntityClass: TagTodoItemEntity,
          CreateDTOClass: TagTodoItemInputDTO,
          UpdateDTOClass: TagTodoItemInputDTO,
        },
        {
          type: 'federated',
          DTOClass: TodoItemReferenceDTO,
          Service: TodoItemService,
        },
      ],
    }),
  ],
})
export class TagModule {}
