export class CreatePaymentDto {
  amount: number
  description: string

  constructor() {
    this.amount = 0
    this.description = ''
  }
}