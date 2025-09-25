import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(to: string, token: string, username?: string): Promise<void> {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    const subject = 'Восстановление пароля';
    const text = `
Здравствуйте${username ? ', ' + username : ''}!

Вы получили это письмо, потому что запросили сброс пароля для вашей учётной записи.

Пожалуйста, перейдите по ссылке, чтобы установить новый пароль:
${resetUrl}

Ссылка действительна в течение 1 часа.

Если вы не запрашивали сброс пароля — проигнорируйте это письмо.

С уважением,
Команда поддержки
    `.trim();

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
  <h2>Здравствуйте${username ? ', ' + username : ''}!</h2>
  <p>Вы получили это письмо, потому что запросили сброс пароля для вашей учётной записи.</p>
  <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Сбросить пароль</a></p>
  <p><small>Ссылка действительна в течение 1 часа.</small></p>
  <p>Если вы не запрашивали сброс пароля — проигнорируйте это письмо.</p>
  <hr>
  <footer>
    <p>С уважением,<br>Команда поддержки</p>
  </footer>
</div>
    `.trim();

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Письмо отправлено на ${to}`);
    } catch (error) {
      console.error(`[EmailService] Ошибка отправки письма на ${to}:`, error);
      throw new Error('Не удалось отправить письмо');
    }
  }
}