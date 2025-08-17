import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'photos-list.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const files = JSON.parse(data);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error reading photos-list.json:', error);
    return NextResponse.json({ error: 'Ошибка чтения photos-list.json' }, { status: 500 });
  }
}
