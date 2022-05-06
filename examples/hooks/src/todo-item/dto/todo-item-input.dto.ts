import { IsString, MaxLength, IsBoolean } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { BeforeCreateMany, BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import { CreatedByHook } from '../../hooks';

@InputType('TodoItemInput')
@BeforeCreateOne(CreatedByHook)
@BeforeCreateMany(CreatedByHook)
export class TodoItemInputDTO {
  @IsString()
  @MaxLength(20)
  @Field()
  title!: string;

  @IsBoolean()
  @Field()
  completed!: boolean;
}
