import { UnauthorizedException, UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { UserDTO } from '../user/user.dto'
import { AuthenticatedUser } from './auth.interfaces'
import { AuthService } from './auth.service'
import { CurrentUser } from './current-user.decorator'
import { LoginInputDTO } from './dto/login-input.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponseDto)
  async login(@Args('input') input: LoginInputDTO): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(input.username, input.password)
    if (!user) {
      throw new UnauthorizedException()
    }
    return this.authService.login(user)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserDTO)
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserDTO> {
    return this.authService.currentUser(user)
  }
}
