import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQuerySequelizeModule } from '@ptc-org/nestjs-query-sequelize';
import { Module } from '@nestjs/common';
import { SubTaskDTO } from './dto/sub-task.dto';
import { CreateSubTaskDTO } from './dto/subtask-input.dto';
import { SubTaskUpdateDTO } from './dto/subtask-update.dto';
import { SubTaskEntity } from './sub-task.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQuerySequelizeModule.forFeature([SubTaskEntity])],
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
