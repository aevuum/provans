// // scripts/list-all-users.ts
// import { prisma } from '../src/lib/prisma';

// async function main() {
//   try {
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         role: true
//       }
//     });
    
//     console.log('Все пользователи в базе данных:');
//     users.forEach(user => {
//       console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email || 'не указан'}, Role: ${user.role}`);
//     });
//   } catch (error) {
//     console.error('Ошибка при получении пользователей:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
