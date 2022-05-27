import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { SubTaskDTO } from './dto/sub-task.dto';
import { CreateSubTaskDTO } from './dto/subtask-input.dto';
import { SubTaskUpdateDTO } from './dto/subtask-update.dto';
import { SubTaskEntity } from './sub-task.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([SubTaskEntity]), AuthModule],
      resolvers: [
        {
          DTOClass: SubTaskDTO,
          EntityClass: SubTaskEntity,
          CreateDTOClass: CreateSubTaskDTO,
          UpdateDTOClass: SubTaskUpdateDTO
        }
      ]
    })
  ]
})
export class SubTaskModule {}
