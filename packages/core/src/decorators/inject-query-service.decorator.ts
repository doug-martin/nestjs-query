import { Inject } from '@nestjs/common'

import { Class } from '../common'
import { getQueryServiceToken } from './helpers'

export const InjectQueryService = <DTO>(DTOClass: Class<DTO>): ReturnType<typeof Inject> => Inject(getQueryServiceToken(DTOClass))
