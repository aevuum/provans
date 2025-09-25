import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';

interface Amount {
  value: string;
  currency: 'RUB';
}

interface Card {
  first6: string;
  last4: string;
  expiry_year: string;
  expiry_month: string;
  card_type: string;
  card_product: {
    code: string;
  };
  issuer_country: string;
}

interface PaymentMethod {
  type: 'bank_card';
  id: string;
  saved: boolean;
  status: string;
  title: string;
  card: Card;
}

interface Recipient {
  account_id: string;
  gateway_id: string;
}

interface Metadata {
  order_id: string;
}

interface AuthorizationDetails {
  rrn: string;
  auth_code: string;
  three_d_secure: {
    applied: boolean;
    method_completed: boolean;
    challenge_completed: boolean;
  };
}

export interface PaymentItem {
  id: string;
  status: 'succeeded' | 'pending' | 'canceled';
  amount: Amount;
  income_amount: Amount;
  description: string;
  recipient: Recipient;
  payment_method: PaymentMethod;
  captured_at: string;
  created_at: string;
  test: boolean;
  refunded_amount: Amount;
  paid: boolean;
  refundable: boolean;
  metadata: Metadata;
  authorization_details: AuthorizationDetails;
}

interface PaymentsResponse {
  type: 'list';
  items: PaymentItem[];
  next_cursor?: string;
}

const fetchPaymentsList = async (): Promise<PaymentsResponse> => {
  const response = await axios.get<PaymentsResponse>(
    '/api/payment/get-list'
  );
  return response.data;
};

export const useGetPaymentsList = (): UseQueryResult<PaymentsResponse> => {
  return useQuery<PaymentsResponse>({
    queryKey: ['payments'],
    queryFn: fetchPaymentsList,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};