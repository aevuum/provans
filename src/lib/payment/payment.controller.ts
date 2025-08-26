import { Body, Controller, Post, Logger, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('api')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  
  constructor(private readonly paymentService: PaymentService) {}

  @Get('health')
  healthCheck() {
    this.logger.log('Health check endpoint called');
    return { status: 'OK', message: 'Payment controller is working' };
  }

  @Post('payment')
  createPayment(@Body() dto: CreatePaymentDto) {
    this.logger.log('Create payment endpoint called');
    this.logger.log(`Received data: ${JSON.stringify(dto)}`);
    return this.paymentService.createPayment(dto);
  }
}