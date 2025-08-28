import { Injectable } from '@nestjs/common';
import { ConfirmationEnum, CurrencyEnum, type PaymentCreateRequest, PaymentMethodsEnum, YookassaService } from 'nestjs-yookassa';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  	constructor(private readonly yookassaService: YookassaService) {}

 	async createPayment(dto: CreatePaymentDto) {
    const orderId = uuidv4();
		const paymentData: PaymentCreateRequest = {
			amount: {
				value: dto.value,
				currency: CurrencyEnum.RUB
			},
			description: dto.description,
			payment_method_data: {
				type: PaymentMethodsEnum.bank_card
			},
			capture: false,
			confirmation: {
				type: ConfirmationEnum.redirect,
				return_url: 'https://localhost:3000/checkout/success'
			},
			metadata: {
				order_id: orderId,
			},
		}

		const newPayment = await this.yookassaService.createPayment(paymentData);

		return newPayment;
  	}
}