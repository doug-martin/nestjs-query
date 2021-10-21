import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { AssociateRelationInputType } from '../../relation-input.type';

@InputType('TagTodoItemRelation')
class TagTodoItemInputType extends AssociateRelationInputType {}

@InputType('TagInput')
export class TagInputDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => [TagTodoItemInputType], { nullable: true })
  @IsOptional()
  @IsArray()
  todoItems?: TagTodoItemInputType[];
}
