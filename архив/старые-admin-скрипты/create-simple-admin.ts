// scripts/create-simple-admin.ts
import { prisma } from '../src/lib/prisma';
import * as bcrypt from 'bcryptjs';

async function main() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@provans.ru',
        password: passwordHash,
        role: 'admin'
      }
    });
    
    console.log('Простой администратор создан:');
    console.log('Email: admin@provans.ru');
    console.log('Пароль: admin123');
    console.log('Данные:', admin);
  } catch (error) {
    if ((error as any).code === 'P2002') {
      console.log('Администратор с таким email уже существует');
    } else {
      console.error('Ошибка при создании администратора:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
