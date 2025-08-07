// Типы для системы заказов
export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    title: string;
    image: string | null;
    images: string[];
  };
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: OrderItem[];
  notes?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  shippingMethod?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface CheckoutFormData {
  // Личная информация
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Адрес доставки
  address: string;
  city: string;
  postalCode: string;
  region: string;
  
  // Опции доставки и оплаты
  shippingMethod: 'courier' | 'pickup' | 'post';
  paymentMethod: 'card' | 'cash' | 'online';
  
  // Дополнительно
  notes?: string;
}
