import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { jwtConstants } from './auth.constants'
import { AuthenticatedUser, JwtPayload } from './auth.interfaces'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret
    })
  }

  validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return Promise.resolve({ id: payload.sub, username: payload.username })
  }
}
