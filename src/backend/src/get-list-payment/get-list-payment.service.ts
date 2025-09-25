import { Injectable } from '@nestjs/common';
import { YookassaService } from 'nestjs-yookassa';

@Injectable()
export class GetListPaymentService {
  constructor(private readonly yookassaService: YookassaService) {}

  async getPaymentsList() {
		const limit = 2;
		const from = '2025-01-01'; 
		const to = '2025-01-31';

		const payments = await this.yookassaService.getPayments(limit, from, to);

		return payments
 	}
}
