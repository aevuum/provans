// // scripts/update-admin-email.ts
// import { prisma } from '../src/lib/prisma';

// async function main() {
//   try {
//     // Обновляем администратора, добавляя email
//     const updatedAdmin = await prisma.user.update({
//       where: { username: 'admin-provans' },
//       data: {
//         email: 'admin@provans.ru'
//       }
//     });
    
//     console.log('Администратор обновлен:', updatedAdmin);
//     console.log('Теперь можно входить через email: admin@provans.ru');
//   } catch (error) {
//     console.error('Ошибка при обновлении администратора:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
