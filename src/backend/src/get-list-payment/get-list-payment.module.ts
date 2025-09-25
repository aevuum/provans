import { Module } from '@nestjs/common';
import { GetListPaymentService } from './get-list-payment.service';
import { GetListPaymentController } from './get-list-payment.controller';

@Module({
  controllers: [GetListPaymentController],
  providers: [GetListPaymentService],
})
export class GetListPaymentModule {}
