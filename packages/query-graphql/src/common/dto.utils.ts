import { ID, ReturnTypeFuncValue } from '@nestjs/graphql'
import { Class } from '@ptc-org/nestjs-query-core'
import { lowerCaseFirst } from 'lower-case-first'
import { plural } from 'pluralize'
import { upperCaseFirst } from 'upper-case-first'

import { getIDField } from '../decorators'
import { findGraphqlObjectMetadata } from './external.utils'

export interface DTONamesOpts {
  dtoName?: string
}

/** @internal */
export interface DTONames {
  baseName: string
  baseNameLower: string
  pluralBaseName: string
  pluralBaseNameLower: string
}

/** @internal */
export const getDTONames = <DTO>(DTOClass: Class<DTO>, opts?: DTONamesOpts): DTONames => {
  const baseName = upperCaseFirst(opts?.dtoName ?? findGraphqlObjectMetadata(DTOClass)?.name ?? DTOClass.name)
  const pluralBaseName = plural(baseName)
  const baseNameLower = lowerCaseFirst(baseName)
  const pluralBaseNameLower = plural(baseNameLower)
  return {
    baseName,
    baseNameLower,
    pluralBaseName,
    pluralBaseNameLower
  }
}

export const getDTOIdTypeOrDefault = (DTOS: Class<unknown>[], defaultType: ReturnTypeFuncValue = ID): ReturnTypeFuncValue => {
  const dtoWithIDField = DTOS.find((dto) => !!getIDField(dto))
  if (dtoWithIDField) {
    return getIDField(dtoWithIDField)?.returnTypeFunc() ?? defaultType
  }
  return defaultType
}
