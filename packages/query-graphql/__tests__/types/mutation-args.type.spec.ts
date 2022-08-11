import { Args, ArgsType, Field, InputType, Int, Query, Resolver } from '@nestjs/graphql'

import { MutationArgsType } from '../../src/types'
import { generateSchema } from '../__fixtures__'

describe('MutationArgsType', (): void => {
  @InputType()
  class FakeType {
    @Field()
    foo!: string
  }

  @ArgsType()
  class MutationArgs extends MutationArgsType(FakeType) {}

  beforeEach(() => jest.clearAllMocks())

  it('should create an args type with an array field', async () => {
    @Resolver()
    class MutationArgsTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args() input: MutationArgs): number {
        return 1
      }
    }

    const schema = await generateSchema([MutationArgsTypeSpec])
    expect(schema).toMatchSnapshot()
  })
})
