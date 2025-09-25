import { PrismaModule } from './../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
