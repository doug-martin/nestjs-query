import { USER_HEADER_NAME } from './constants';
import { GqlContext } from './auth.guard';

export const getUserName = (context: GqlContext): string => context.request.headers[USER_HEADER_NAME];
