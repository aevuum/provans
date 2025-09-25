import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(email: string, token: string, username: string): Promise<void> {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Восстановление пароля - Provans Decor',
        template: './password-reset',
        context: {
          username,
          resetUrl,
          expiresIn: '1 час',
        },
      });
    } catch (error) {
      console.error('Ошибка отправки email:', error);
      throw new Error('Не удалось отправить письмо для восстановления пароля');
    }
  }
}