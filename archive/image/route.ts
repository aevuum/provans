// import { NextRequest, NextResponse } from 'next/server';
// import path from 'path';
// import { promises as fs } from 'fs';

// export async function GET(req: NextRequest) {
//   try {
//     const url = new URL(req.url);
//     const filePath = url.searchParams.get('path');
//     if (!filePath) {
//       return new NextResponse('No path', { status: 400 });
//     }
//     // Удаляем ведущий слэш и декодируем
//     const relPath = decodeURIComponent(filePath).replace(/^\/+/, '');
//     const absPath = path.join(process.cwd(), 'public', relPath);

//     // Проверяем, что файл реально существует
//     await fs.access(absPath);

//     const fileBuffer = await fs.readFile(absPath);
//     const ext = path.extname(absPath).toLowerCase();
//     const mime =
//       ext === '.jpg' || ext === '.jpeg'
//         ? 'image/jpeg'
//         : ext === '.png'
//         ? 'image/png'
//         : 'application/octet-stream';

//    return new NextResponse(new Uint8Array(fileBuffer), {
//   status: 200,
//   headers: { 'Content-Type': mime },
// });
//   } catch (e) {
//     console.error('Ошибка загрузки изображения:', e);
//     return new NextResponse('Not found', { status: 404 });
//   }
// }
