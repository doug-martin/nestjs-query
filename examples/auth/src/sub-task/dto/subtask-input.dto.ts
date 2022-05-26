import { Field, InputType, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import {
  BeforeCreateMany,
  BeforeCreateOne,
  CreateManyInputType,
  CreateOneInputType
} from '@ptc-org/nestjs-query-graphql';
import { UserContext } from '../../auth/auth.interfaces';

@InputType('SubTaskInput')
@BeforeCreateOne((input: CreateOneInputType<CreateSubTaskDTO>, context: UserContext) => {
  const { id: ownerId, username: createdBy } = context.req.user;
  return { input: { ...input.input, createdBy, ownerId } };
})
@BeforeCreateMany((input: CreateManyInputType<CreateSubTaskDTO>, context: UserContext) => {
  const { id: ownerId, username: createdBy } = context.req.user;
  return { input: input.input.map((c) => ({ ...c, createdBy, ownerId })) };
})
export class CreateSubTaskDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Field()
  @IsBoolean()
  completed!: boolean;

  @Field(() => ID)
  @IsNotEmpty()
  todoItemId!: string;

  // dont expose in the schema
  ownerId!: number;

  createdBy!: string;
}
