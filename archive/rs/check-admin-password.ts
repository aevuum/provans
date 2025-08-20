// // scripts/check-admin-password.ts
// import { prisma } from '../src/lib/prisma';
// import * as bcrypt from 'bcryptjs';

// async function main() {
//   try {
//     const user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { username: 'admin@provans.ru' },
//           { email: 'admin@provans.ru' }
//         ]
//       }
//     });
    
//     if (!user) {
//       console.log('❌ Пользователь с email admin@provans.ru не найден');
//       return;
//     }
    
//     console.log('✅ Пользователь найден:');
//     console.log('ID:', user.id);
//     console.log('Username:', user.username);
//     console.log('Email:', user.email);
//     console.log('Role:', user.role);
//     console.log('Password hash:', user.password);
    
//     // Проверим пароль 'provans'
//     const isValidProvans = await bcrypt.compare('provans', user.password || '');
//     console.log('\n🔐 Проверка паролей:');
//     console.log('Пароль "provans" подходит:', isValidProvans ? '✅ ДА' : '❌ НЕТ');
    
//     // Проверим пароль 'admin123' 
//     const isValidAdmin123 = await bcrypt.compare('admin123', user.password || '');
//     console.log('Пароль "admin123" подходит:', isValidAdmin123 ? '✅ ДА' : '❌ НЕТ');
    
//   } catch (error) {
//     console.error('Ошибка при проверке пользователя:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
