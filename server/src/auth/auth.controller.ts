import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SimpleAuthGuard } from './simple-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: RegisterDto) {
    return this.authService.login(dto);
  }

  /**
   * Request a fresh JWT representing the current state of the user.
   * The incoming token is validated by the guard, but the returned
   * value is re-signed after looking up the user in the database.
   */
  @Get('refresh')
  @UseGuards(SimpleAuthGuard)
  async refreshToken(@Request() req: { user: { sub: string } }) {
    // req.user set by SimpleAuthGuard
    return this.authService.refreshToken(req.user.sub);
  }

  @UseGuards(SimpleAuthGuard)
  @Get()
  getUsers() {
    return this.authService.getUsers();
  }
}
