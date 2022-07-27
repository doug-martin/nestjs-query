import { NestjsQueryGraphQLModule } from '@codeshine/nestjs-query-graphql';
import { Module } from '@nestjs/common';
import { NestjsQueryTypegooseModule } from '@codeshine/nestjs-query-typegoose';
import { SubTaskDTO } from './dto/sub-task.dto';
import { CreateSubTaskDTO } from './dto/subtask-input.dto';
import { SubTaskUpdateDTO } from './dto/subtask-update.dto';
import { SubTaskEntity } from './sub-task.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypegooseModule.forFeature([SubTaskEntity])],
      resolvers: [
        {
          DTOClass: SubTaskDTO,
          EntityClass: SubTaskEntity,
          CreateDTOClass: CreateSubTaskDTO,
          UpdateDTOClass: SubTaskUpdateDTO,
          enableAggregate: true,
        },
      ],
    }),
  ],
})
export class SubTaskModule {}
