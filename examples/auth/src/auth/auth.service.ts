import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core'

import { UserDTO } from '../user/user.dto'
import { UserEntity } from '../user/user.entity'
import { AuthenticatedUser, JwtPayload } from './auth.interfaces'
import { LoginResponseDto } from './dto/login-response.dto'

@Injectable()
export class AuthService {
  constructor(@InjectQueryService(UserEntity) private usersService: QueryService<UserEntity>, private jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<AuthenticatedUser | null> {
    const [user] = await this.usersService.query({ filter: { username: { eq: username } }, paging: { limit: 1 } })
    // dont use plain text passwords in production!
    if (user && user.password === pass) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async currentUser(authUser: AuthenticatedUser): Promise<UserDTO> {
    try {
      const user = await this.usersService.getById(authUser.id)
      return user
    } catch (e) {
      throw new UnauthorizedException()
    }
  }

  login(user: AuthenticatedUser): Promise<LoginResponseDto> {
    const payload: JwtPayload = { username: user.username, sub: user.id }
    return Promise.resolve({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      accessToken: this.jwtService.sign(payload)
    })
  }
}
