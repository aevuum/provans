// scripts/check-old-admin.ts
import { prisma } from '../src/lib/prisma';
import * as bcrypt from 'bcryptjs';

async function main() {
  try {
    const admin = await prisma.user.findUnique({
      where: { username: 'admin-provans' }
    });
    
    if (!admin) {
      console.log('❌ Администратор admin-provans не найден');
      return;
    }
    
    console.log('👤 Администратор admin-provans:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password hash: ${admin.password}`);
    
    // Проверим пароль 'provans'
    const isValidProvans = await bcrypt.compare('provans', admin.password || '');
    console.log(`   Пароль "provans": ${isValidProvans ? '✅ ДА' : '❌ НЕТ'}`);
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
