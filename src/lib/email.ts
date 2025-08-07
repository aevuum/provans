// lib/email.ts
// Система отправки email уведомлений

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
}

// Функция отправки email (заглушка для будущей интеграции)
export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    console.log('Sending email:', {
      to: data.to,
      subject: data.subject,
      text: data.text
    });
    
    // TODO: Интеграция с реальным email сервисом (NodeMailer, SendGrid, etc.)
    // Например:
    // const transporter = nodemailer.createTransporter({...});
    // await transporter.sendMail(data);
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Отправка уведомления о новом заказе
export async function sendOrderConfirmation(orderData: OrderEmailData): Promise<boolean> {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Подтверждение заказа №${orderData.orderNumber}</h2>
      
      <p>Здравствуйте, ${orderData.customerName}!</p>
      
      <p>Спасибо за ваш заказ в магазине декора Прованс. Ваш заказ принят и обрабатывается.</p>
      
      <h3>Детали заказа:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Товар</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Количество</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Цена</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.items.map(item => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${item.title}</td>
              <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${item.price.toLocaleString('ru-RU')} ₽</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <p style="font-size: 18px; font-weight: bold; text-align: right;">
        Итого: ${orderData.total.toLocaleString('ru-RU')} ₽
      </p>
      
      <p>Статус заказа: <strong>${getStatusText(orderData.status)}</strong></p>
      
      <p>Мы свяжемся с вами в ближайшее время для уточнения деталей доставки.</p>
      
      <hr style="margin: 30px 0;">
      
      <p style="color: #666; font-size: 14px;">
        С уважением,<br>
        Команда магазина декора Прованс
      </p>
    </div>
  `;

  const emailText = `
Подтверждение заказа №${orderData.orderNumber}

Здравствуйте, ${orderData.customerName}!

Спасибо за ваш заказ в магазине декора Прованс. Ваш заказ принят и обрабатывается.

Детали заказа:
${orderData.items.map(item => 
  `${item.title} - ${item.quantity} шт. - ${item.price.toLocaleString('ru-RU')} ₽`
).join('\n')}

Итого: ${orderData.total.toLocaleString('ru-RU')} ₽
Статус заказа: ${getStatusText(orderData.status)}

Мы свяжемся с вами в ближайшее время для уточнения деталей доставки.

С уважением,
Команда магазина декора Прованс
  `;

  return await sendEmail({
    to: orderData.customerEmail,
    subject: `Подтверждение заказа №${orderData.orderNumber}`,
    text: emailText,
    html: emailHtml
  });
}

// Отправка уведомления об изменении статуса заказа
export async function sendOrderStatusUpdate(orderData: OrderEmailData): Promise<boolean> {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Обновление статуса заказа №${orderData.orderNumber}</h2>
      
      <p>Здравствуйте, ${orderData.customerName}!</p>
      
      <p>Статус вашего заказа изменился:</p>
      
      <p style="font-size: 18px; font-weight: bold; color: #007bff;">
        ${getStatusText(orderData.status)}
      </p>
      
      ${getStatusDescription(orderData.status)}
      
      <hr style="margin: 30px 0;">
      
      <p style="color: #666; font-size: 14px;">
        С уважением,<br>
        Команда магазина декора Прованс
      </p>
    </div>
  `;

  const emailText = `
Обновление статуса заказа №${orderData.orderNumber}

Здравствуйте, ${orderData.customerName}!

Статус вашего заказа изменился: ${getStatusText(orderData.status)}

С уважением,
Команда магазина декора Прованс
  `;

  return await sendEmail({
    to: orderData.customerEmail,
    subject: `Обновление заказа №${orderData.orderNumber}`,
    text: emailText,
    html: emailHtml
  });
}

// Получение текста статуса на русском языке
function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    'PENDING': 'Ожидает подтверждения',
    'CONFIRMED': 'Подтвержден',
    'PROCESSING': 'Обрабатывается',
    'SHIPPED': 'Отправлен',
    'DELIVERED': 'Доставлен',
    'CANCELLED': 'Отменен',
    'REFUNDED': 'Возвращен'
  };
  
  return statusTexts[status] || status;
}

// Получение описания статуса
function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    'PENDING': '<p>Ваш заказ получен и ожидает подтверждения. Мы свяжемся с вами в ближайшее время.</p>',
    'CONFIRMED': '<p>Ваш заказ подтвержден и передан в обработку.</p>',
    'PROCESSING': '<p>Ваш заказ обрабатывается. Товары готовятся к отправке.</p>',
    'SHIPPED': '<p>Ваш заказ отправлен! Ожидайте доставку в ближайшее время.</p>',
    'DELIVERED': '<p>Ваш заказ успешно доставлен. Спасибо за покупку!</p>',
    'CANCELLED': '<p>Ваш заказ был отменен. Если у вас есть вопросы, свяжитесь с нами.</p>',
    'REFUNDED': '<p>По вашему заказу был произведен возврат средств.</p>'
  };
  
  return descriptions[status] || '';
}

// Отправка уведомления администратору о новом заказе
export async function sendAdminOrderNotification(orderData: OrderEmailData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@provans-decor.ru';
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Новый заказ №${orderData.orderNumber}</h2>
      
      <h3>Информация о клиенте:</h3>
      <p><strong>Имя:</strong> ${orderData.customerName}</p>
      <p><strong>Email:</strong> ${orderData.customerEmail}</p>
      
      <h3>Состав заказа:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Товар</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Количество</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Цена</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.items.map(item => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${item.title}</td>
              <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${item.price.toLocaleString('ru-RU')} ₽</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <p style="font-size: 18px; font-weight: bold; text-align: right;">
        Итого: ${orderData.total.toLocaleString('ru-RU')} ₽
      </p>
    </div>
  `;

  return await sendEmail({
    to: adminEmail,
    subject: `Новый заказ №${orderData.orderNumber}`,
    text: `Новый заказ от ${orderData.customerName} (${orderData.customerEmail}) на сумму ${orderData.total.toLocaleString('ru-RU')} ₽`,
    html: emailHtml
  });
}
