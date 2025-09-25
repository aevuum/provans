import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('password/forgot')
  async forgot(@Body('email') email: string) {
    if (!email) throw new HttpException('Email обязателен', HttpStatus.BAD_REQUEST);
    await this.authService.initiatePasswordReset(email);
    return { message: 'Инструкции по восстановлению отправлены (если пользователь существует)' };
  }

  @Post('password/reset')
  async reset(@Body() body: { token: string; password: string }) {
    const { token, password } = body || {} as any;
    if (!token || !password) throw new HttpException('Токен и пароль обязательны', HttpStatus.BAD_REQUEST);
    await this.authService.resetPassword(token, password);
    return { message: 'Пароль изменён' };
  }
}
