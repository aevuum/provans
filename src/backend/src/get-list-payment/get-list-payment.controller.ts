import { Controller, Get } from '@nestjs/common';
import { GetListPaymentService } from './get-list-payment.service';

@Controller('/api/payment')
export class GetListPaymentController {
  constructor(private readonly getListPaymentService: GetListPaymentService) {}

  @Get('get-list')
  async getPaymentsList() {
    return this.getListPaymentService.getPaymentsList();
  }
}
