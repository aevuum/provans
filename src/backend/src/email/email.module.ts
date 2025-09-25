import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.EMAIL_USER}>`,
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}