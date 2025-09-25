import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { YookassaModule } from 'nestjs-yookassa';

@Module({
  imports: [
    YookassaModule.forRoot({
      shopId: "1152534",
      apiKey: "test_srOYKLFtnVzDOIS7up9VtfgLFGPyxHy7pbH9ZMp-NjY"
    })
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
