import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  getUserEmail(userName: string): Promise<string> {
    return Promise.resolve(`${userName}@nestjs-query.com`)
  }
}
