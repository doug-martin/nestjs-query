import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginInputDTO } from './dto/login-input.dto';
import { UserDTO } from '../user/user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthenticatedUser } from './auth.interfaces';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponseDto)
  async login(@Args('input') input: LoginInputDTO): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(input.username, input.password);
    if (!user) {
      throw new UnauthorizedException('NO USER');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserDTO)
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserDTO> {
    return this.authService.currentUser(user);
  }
}
