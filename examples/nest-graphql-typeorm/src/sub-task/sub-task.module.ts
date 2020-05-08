import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql/src';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { SubTaskDTO } from './dto/sub-task.dto';
import { CreateSubTaskDTO } from './dto/subtask-input.dto';
import { SubTaskUpdateDTO } from './dto/subtask-update.dto';
import { SubTaskEntity } from './sub-task.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([SubTaskEntity])],
      resolvers: [
        {
          DTOClass: SubTaskDTO,
          EntityClass: SubTaskEntity,
          CreateDTOClass: CreateSubTaskDTO,
          UpdateDTOClass: SubTaskUpdateDTO,
        },
      ],
    }),
  ],
})
export class SubTaskModule {}
