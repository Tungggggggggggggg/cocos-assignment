import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-local')
  async loginLocal(@Body() body: any) {
    return this.authService.validateLocalUser(body.email, body.password);
  }
}
