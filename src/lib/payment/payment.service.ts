import { Injectable } from '@nestjs/common';


import { ConfirmationEnum, CurrencyEnum, type PaymentCreateRequest, PaymentMethodsEnum, YookassaService } from 'nestjs-yookassa'
import { CreatePaymentDto } from './dto/create-payment.dto';




@Injectable()
export class PaymentService {
  	constructor(private readonly yookassaService: YookassaService) {}

 	async createPayment(dto: CreatePaymentDto) {
		const paymentData: PaymentCreateRequest = {
			amount: {
				value: dto.amount,
				currency: CurrencyEnum.RUB
			},
			description: dto.description,
			payment_method_data: {
				type: PaymentMethodsEnum.yoo_money
			},
			capture: false,
			confirmation: {
				type: ConfirmationEnum.redirect,
				return_url: 'https://example.com/thanks'
			},
			metadata: {
				order_id: '12345678',
			},
		}
    try {
      const newPayment = await this.yookassaService.createPayment(paymentData);
		  return newPayment;
    }
    catch (e) {
      console.log(e);
    }
  	}
}
