import { Field, ID, InputType } from '@nestjs/graphql'
import { BeforeCreateMany, BeforeCreateOne, CreateManyInputType, CreateOneInputType } from '@ptc-org/nestjs-query-graphql'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { GqlContext } from '../../auth.guard'
import { getUserName } from '../../helpers'
import { SubTaskDTO } from './sub-task.dto'

@InputType('SubTaskInput')
@BeforeCreateOne((input: CreateOneInputType<SubTaskDTO>, context: GqlContext) => {
  // eslint-disable-next-line no-param-reassign
  input.input.createdBy = getUserName(context)
  return input
})
@BeforeCreateMany((input: CreateManyInputType<SubTaskDTO>, context: GqlContext) => {
  const createdBy = getUserName(context)
  // eslint-disable-next-line no-param-reassign
  input.input = input.input.map((c) => ({ ...c, createdBy }))
  return input
})
export class CreateSubTaskDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string

  @Field()
  @IsBoolean()
  completed!: boolean

  @Field(() => ID)
  @IsNotEmpty()
  todoItem!: string
}
