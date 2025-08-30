import { ICreatePayment, YooCheckout } from '@a2seven/yoo-checkout'; 
import express, { Request, Response } from 'express';
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3000
const checkout = new YooCheckout({ shopId: process.env.YOOKASA_SHOP_ID!, secretKey: process.env.YOOKASA_SECRET_KEY! });
const idempotenceKey =  uuidv4();

app.use(cors())
app.use(express.json())

app.post('/api/payment', async (req: Request, res: Response) => {
  const createPayload: ICreatePayment = {
    amount: {
        value: '2.00',
        currency: 'RUB'
    },
    payment_method_data: {
        type: 'bank_card'
    },
    confirmation: {
        type: 'redirect',
        return_url: 'http://localhost:3000/checkout/success',
    }
};

try {
    const payment = await checkout.createPayment(createPayload, idempotenceKey);
    console.log(payment)
} catch (error) {
     console.error(error);
}
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});