// // scripts/reset-admin-password.ts
// import { prisma } from '../src/lib/prisma';
// import * as bcrypt from 'bcryptjs';

// async function main() {
//   try {
//     const newPasswordHash = await bcrypt.hash('provans123', 10);
    
//     const updatedAdmin = await prisma.user.update({
//       where: { username: 'admin-provans' },
//       data: { password: newPasswordHash }
//     });
    
//     console.log('✅ Пароль администратора admin-provans обновлен');
//     console.log('Email: admin@provans.ru (или username: admin-provans)');
//     console.log('Новый пароль: provans123');
    
//   } catch (error) {
//     console.error('Ошибка при обновлении пароля:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
