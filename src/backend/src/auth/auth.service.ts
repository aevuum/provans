import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async createResetToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 час

    await this.prisma.resetToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async validateResetToken(token: string): Promise<number | null> {
    const resetToken = await this.prisma.resetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
    });

    return resetToken ? resetToken.userId : null;
  }

  async deleteResetToken(token: string): Promise<void> {
    await this.prisma.resetToken.deleteMany({
      where: { token },
    });
  }

  async initiatePasswordReset(emailOrUsername: string): Promise<void> {
    const identifier = emailOrUsername.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { 
        OR: [
          { email: identifier }, 
          { username: identifier }
        ] 
      },
      select: { 
        id: true, 
        email: true, 
        username: true 
      },
    });
    
    if (!user) return; // безопасно: не раскрываем существование
    
    // Если у пользователя нет email — ничего не делаем (не раскрываем информацию)
    if (!user.email) return;

    const token = await this.createResetToken(user.id);

    // Отправляем email
    await this.mailService.sendPasswordResetEmail(
      user.email,
      token,
      user.username
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 6) {
      throw new HttpException('Пароль должен быть не менее 6 символов', HttpStatus.BAD_REQUEST);
    }
    
    const userId = await this.validateResetToken(token);
    if (!userId) {
      throw new HttpException('Неверный или просроченный токен', HttpStatus.BAD_REQUEST);
    }
    
    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ 
      where: { id: userId }, 
      data: { password: hash } 
    });
    
    await this.deleteResetToken(token);
  }
}