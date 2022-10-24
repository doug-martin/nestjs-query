import { GqlContext } from './auth.guard'
import { USER_HEADER_NAME } from './constants'

export const getUserName = (context: GqlContext): string => context.request.headers[USER_HEADER_NAME]
