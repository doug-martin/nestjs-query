import { Query, Resolver } from '@nestjs/graphql'

import { ReferencesOpts, ReferencesRelationsResolver } from '../../../src/resolvers/relations'
import { createResolverFromNest, generateSchema, TestRelationDTO, TestResolverDTO, TestService } from '../../__fixtures__'

@Resolver(() => TestResolverDTO)
class TestResolver extends ReferencesRelationsResolver(TestResolverDTO, {
  reference: { DTO: TestRelationDTO, keys: { id: 'stringField' } }
}) {
  constructor(service: TestService) {
    super(service)
  }
}

describe('ReferencesRelationMixin', () => {
  const expectResolverSDL = async (opts?: ReferencesOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends ReferencesRelationsResolver(TestResolverDTO, opts ?? {}) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' }
      }
    }

    const schema = await generateSchema([TestSDLResolver])
    expect(schema).toMatchSnapshot()
  }
  it('should not add reference methods if references empty', () => expectResolverSDL())

  it('should use the add the reference if provided', () =>
    expectResolverSDL({ reference: { DTO: TestRelationDTO, keys: { id: 'stringField' }, dtoName: 'Test' } }))

  it('should set the field to nullable if set to true', () =>
    expectResolverSDL({ reference: { DTO: TestRelationDTO, keys: { id: 'stringField' }, nullable: true } }))

  it('should return a references type from the passed in dto', async () => {
    const { resolver } = await createResolverFromNest(TestResolver)
    const dto: TestResolverDTO = {
      id: 'id-1',
      stringField: 'reference-id-1'
    }
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = await resolver.referenceReference(dto)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return expect(result).toEqual({ __typename: 'Reference', id: dto.stringField })
  })
})
