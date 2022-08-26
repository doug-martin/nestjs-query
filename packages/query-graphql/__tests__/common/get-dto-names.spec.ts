import { Field, ObjectType } from '@nestjs/graphql'

import { getDTONames } from '../../src/common'

describe('getDTONames', () => {
  @ObjectType('SomeDTO')
  class DTO {
    @Field()
    str!: string
  }

  it('should use the @nestjs/graphql name for the dto', () => {
    const { baseName, baseNameLower, pluralBaseNameLower, pluralBaseName } = getDTONames(DTO)
    expect(baseName).toBe('SomeDTO')
    expect(baseNameLower).toBe('someDTO')
    expect(pluralBaseName).toBe('SomeDTOS')
    expect(pluralBaseNameLower).toBe('someDTOS')
  })

  it('should use the dtoName if specified', () => {
    const { baseName, baseNameLower, pluralBaseNameLower, pluralBaseName } = getDTONames(DTO, {
      dtoName: 'NamedObj'
    })
    expect(baseName).toBe('NamedObj')
    expect(baseNameLower).toBe('namedObj')
    expect(pluralBaseName).toBe('NamedObjs')
    expect(pluralBaseNameLower).toBe('namedObjs')
  })

  it('should fall back to the class name', () => {
    class OtherDTO {
      @Field()
      str!: string
    }

    const { baseName, baseNameLower, pluralBaseNameLower, pluralBaseName } = getDTONames(OtherDTO)
    expect(baseName).toBe('OtherDTO')
    expect(baseNameLower).toBe('otherDTO')
    expect(pluralBaseName).toBe('OtherDTOS')
    expect(pluralBaseNameLower).toBe('otherDTOS')
  })
})
