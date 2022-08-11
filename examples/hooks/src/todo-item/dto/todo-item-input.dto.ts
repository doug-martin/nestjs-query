import { Field, InputType } from '@nestjs/graphql'
import { BeforeCreateMany, BeforeCreateOne } from '@ptc-org/nestjs-query-graphql'
import { IsBoolean, IsString, MaxLength } from 'class-validator'

import { CreatedByHook } from '../../hooks'

@InputType('TodoItemInput')
@BeforeCreateOne(CreatedByHook)
@BeforeCreateMany(CreatedByHook)
export class TodoItemInputDTO {
  @IsString()
  @MaxLength(20)
  @Field()
  title!: string

  @IsBoolean()
  @Field()
  completed!: boolean
}
