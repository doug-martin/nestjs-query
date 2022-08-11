import { Inject } from '@nestjs/common'

import { pubSubToken } from '../subscription'

export const InjectPubSub = (): ParameterDecorator => Inject(pubSubToken())
