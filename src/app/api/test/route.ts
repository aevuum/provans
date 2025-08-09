import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'API is working',
      data: []
    });
  } catch {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test error'
      }, 
      { status: 500 }
    );
  }
}
