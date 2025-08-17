// // scripts/admin-manager.ts
// import { prisma } from '@/lib/prisma';
// import * as bcrypt from 'bcryptjs';

// interface AdminData {
//   username: string;
//   email?: string;
//   password: string;
//   role: 'admin';
// }

// class AdminManager {
//   // Создание нового администратора
//   async createAdmin(data: AdminData): Promise<void> {
//     try {
//       const passwordHash = await bcrypt.hash(data.password, 10);
      
//       const admin = await prisma.user.create({
//         data: {
//           username: data.username,
//           email: data.email,
//           password: passwordHash,
//           role: data.role
//         }
//       });
      
//       console.log('✅ Администратор создан:');
//       console.log(`   Username: ${admin.username}`);
//       console.log(`   Email: ${admin.email || 'не указан'}`);
//       console.log(`   Password: ${data.password}`);
//     } catch (error: any) {
//       if (error.code === 'P2002') {
//         console.log('❌ Администратор с такими данными уже существует');
//       } else {
//         console.error('❌ Ошибка при создании администратора:', error.message);
//       }
//     }
//   }

//   // Список всех администраторов
//   async listAdmins(): Promise<void> {
//     try {
//       const admins = await prisma.user.findMany({
//         where: { role: 'admin' },
//         select: {
//           id: true,
//           username: true,
//           email: true,
//           role: true
//         }
//       });
      
//       console.log(`🔍 Найдено администраторов: ${admins.length}\n`);
      
//       admins.forEach(admin => {
//         console.log(`👤 #${admin.id}: ${admin.username}`);
//         console.log(`   Email: ${admin.email || 'не указан'}`);
//         console.log('');
//       });
//     } catch (error) {
//       console.error('❌ Ошибка при получении списка администраторов:', error);
//     }
//   }

//   // Проверка пароля администратора
//   async checkPassword(identifier: string, password: string): Promise<void> {
//     try {
//       const admin = await prisma.user.findFirst({
//         where: {
//           AND: [
//             { role: 'admin' },
//             {
//               OR: [
//                 { username: identifier },
//                 { email: identifier }
//               ]
//             }
//           ]
//         }
//       });
      
//       if (!admin) {
//         console.log(`❌ Администратор '${identifier}' не найден`);
//         return;
//       }
      
//       const isValid = await bcrypt.compare(password, admin.password || '');
      
//       console.log(`👤 Администратор: ${admin.username}`);
//       console.log(`📧 Email: ${admin.email || 'не указан'}`);
//       console.log(`🔐 Пароль '${password}': ${isValid ? '✅ ВЕРНЫЙ' : '❌ НЕВЕРНЫЙ'}`);
      
//     } catch (error) {
//       console.error('❌ Ошибка при проверке пароля:', error);
//     }
//   }

//   // Обновление пароля администратора
//   async updatePassword(identifier: string, newPassword: string): Promise<void> {
//     try {
//       const passwordHash = await bcrypt.hash(newPassword, 10);
      
//       const admin = await prisma.user.updateMany({
//         where: {
//           AND: [
//             { role: 'admin' },
//             {
//               OR: [
//                 { username: identifier },
//                 { email: identifier }
//               ]
//             }
//           ]
//         },
//         data: { password: passwordHash }
//       });
      
//       if (admin.count === 0) {
//         console.log(`❌ Администратор '${identifier}' не найден`);
//         return;
//       }
      
//       console.log('✅ Пароль администратора обновлен');
//       console.log(`   Идентификатор: ${identifier}`);
//       console.log(`   Новый пароль: ${newPassword}`);
      
//     } catch (error) {
//       console.error('❌ Ошибка при обновлении пароля:', error);
//     }
//   }

//   // Обновление email администратора
//   async updateEmail(username: string, newEmail: string): Promise<void> {
//     try {
//       const admin = await prisma.user.update({
//         where: { username },
//         data: { email: newEmail }
//       });
      
//       console.log('✅ Email администратора обновлен');
//       console.log(`   Username: ${admin.username}`);
//       console.log(`   Новый email: ${admin.email}`);
      
//     } catch (error: any) {
//       if (error.code === 'P2025') {
//         console.log(`❌ Администратор '${username}' не найден`);
//       } else {
//         console.error('❌ Ошибка при обновлении email:', error.message);
//       }
//     }
//   }
// }

// // CLI интерфейс
// async function main() {
//   const manager = new AdminManager();
//   const command = process.argv[2];
  
//   try {
//     switch (command) {
//       case 'create':
//         const username = process.argv[3];
//         const email = process.argv[4];
//         const password = process.argv[5];
        
//         if (!username || !password) {
//           console.log('Использование: npx tsx admin-manager.ts create <username> <email> <password>');
//           return;
//         }
        
//         await manager.createAdmin({
//           username,
//           email: email || undefined,
//           password,
//           role: 'admin'
//         });
//         break;
        
//       case 'list':
//         await manager.listAdmins();
//         break;
        
//       case 'check':
//         const identifier = process.argv[3];
//         const testPassword = process.argv[4];
        
//         if (!identifier || !testPassword) {
//           console.log('Использование: npx tsx admin-manager.ts check <username|email> <password>');
//           return;
//         }
        
//         await manager.checkPassword(identifier, testPassword);
//         break;
        
//       case 'update-password':
//         const adminId = process.argv[3];
//         const newPassword = process.argv[4];
        
//         if (!adminId || !newPassword) {
//           console.log('Использование: npx tsx admin-manager.ts update-password <username|email> <new-password>');
//           return;
//         }
        
//         await manager.updatePassword(adminId, newPassword);
//         break;
        
//       case 'update-email':
//         const adminUsername = process.argv[3];
//         const newEmail = process.argv[4];
        
//         if (!adminUsername || !newEmail) {
//           console.log('Использование: npx tsx admin-manager.ts update-email <username> <new-email>');
//           return;
//         }
        
//         await manager.updateEmail(adminUsername, newEmail);
//         break;
        
//       default:
//         console.log('📋 Доступные команды:');
//         console.log('  create <username> <email> <password>  - Создать администратора');
//         console.log('  list                                  - Показать всех администраторов');
//         console.log('  check <username|email> <password>    - Проверить пароль');
//         console.log('  update-password <id> <new-password>  - Обновить пароль');
//         console.log('  update-email <username> <new-email>  - Обновить email');
//         console.log('');
//         console.log('Примеры:');
//         console.log('  npx tsx admin-manager.ts create admin admin@test.ru admin123');
//         console.log('  npx tsx admin-manager.ts list');
//         console.log('  npx tsx admin-manager.ts check admin@test.ru admin123');
//     }
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
