import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType({ isAbstract: true })
export abstract class AssociateRelationInputType {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;
}
