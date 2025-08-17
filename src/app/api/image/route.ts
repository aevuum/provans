import { NextRequest, NextResponse } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');
    
    if (!imagePath) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

  // Декодируем путь









  const decodedPath = decodeURIComponent(imagePath).replace(/^[/\\]+/, '');
  if (decodedPath.includes('..')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  const publicUrl = `/${decodedPath}`;
  return NextResponse.redirect(publicUrl, 302);
}
