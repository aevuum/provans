// scripts/check-all-admins.ts
import { prisma } from '../../src/lib/prisma';
import * as bcrypt from 'bcryptjs';

async function main() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' }
    });
    
    console.log(`🔍 Найдено администраторов: ${admins.length}\n`);
    
    for (const admin of admins) {
      console.log(`👤 Администратор #${admin.id}:`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email || 'не указан'}`);
      
      // Проверим разные пароли
      const passwords = ['provans', 'admin123', 'admin'];
      for (const password of passwords) {
        const isValid = await bcrypt.compare(password, admin.password || '');
        if (isValid) {
          console.log(`   ✅ Пароль: "${password}"`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('Ошибка при проверке администраторов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
