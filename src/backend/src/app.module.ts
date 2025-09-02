import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { GetListPaymentModule } from './get-list-payment/get-list-payment.module';

@Module({
  imports: [PaymentModule, GetListPaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
