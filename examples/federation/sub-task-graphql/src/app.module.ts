import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTaskModule } from './sub-task/sub-task.module';
import { typeormOrmConfig } from '../../../helpers';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_sub_task')),
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
    }),
    SubTaskModule,
  ],
})
export class AppModule {}
