import { UserEntity } from '../user/user.entity'

export type AuthenticatedUser = Pick<UserEntity, 'id' | 'username'>
export type JwtPayload = {
  sub: number
  username: string
}

export type UserContext = {
  req: {
    user: AuthenticatedUser
  }
}
