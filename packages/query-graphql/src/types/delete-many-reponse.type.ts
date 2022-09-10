import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Class, DeleteManyResponse } from '@ptc-org/nestjs-query-core'

/** @internal */
let deleteManyResponseType: Class<DeleteManyResponse> | null = null

export const DeleteManyResponseType = (): Class<DeleteManyResponse> => {
  if (deleteManyResponseType) {
    return deleteManyResponseType
  }

  @ObjectType('DeleteManyResponse')
  class DeleteManyResponseTypeImpl implements DeleteManyResponse {
    @Field(() => Int, { description: 'The number of records deleted.' })
    deletedCount!: number
  }

  deleteManyResponseType = DeleteManyResponseTypeImpl
  return deleteManyResponseType
}
