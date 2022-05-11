import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import { CustomIDScalar } from '../../common/custom-id.scalar';

@InputType('SubTaskUpdate')
export class SubTaskUpdateDTO {
  @Field()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @Field(() => CustomIDScalar, { nullable: true })
  @IsOptional()
  @IsNotEmpty()
  todoItemId?: string;
}
