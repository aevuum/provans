import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { GetListPaymentModule } from './get-list-payment/get-list-payment.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PaymentModule, GetListPaymentModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
