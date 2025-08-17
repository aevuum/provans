// // scripts/create-admin.ts
// import { prisma } from '../src/lib/prisma';
// import * as bcrypt from 'bcryptjs';
// async function main() {
//   const passwordHash = await bcrypt.hash('provans', 10);
//   await prisma.user.create({
//     data: {
//       username: 'admin-provans',
//       password: passwordHash,
//       role: 'admin'
//     }
//   });
//   console.log('Админ создан');
//   await prisma.$disconnect();
// }

// main();