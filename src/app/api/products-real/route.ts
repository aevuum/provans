import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const type = searchParams.get('type');

    const whereClause: Record<string, unknown> = {
      isConfirmed: true
    };

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    
    if (type === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (type === 'discount') {
    
      whereClause.discount = { gt: 0 };
      orderBy = { discount: 'desc' };
    } else if (type === 'popular') {
      orderBy = { title: 'asc' };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit
    });

    const total = await prisma.product.count({
      where: whereClause
    });

    const formattedProducts = products.map(product => {
      let imageUrls: string[] = [];
      if (product.images && product.images.length > 0) {
        imageUrls = product.images;
      } else if (product.image) {
        imageUrls = [product.image];
      }

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        description: product.comment,
        size: product.size,
        category: product.category,
        subcategory: product.subcategory,
        isConfirmed: product.isConfirmed,
        quantity: product.quantity,
        reserved: product.reserved,
        barcode: product.barcode,
        images: imageUrls,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении товаров',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      search,
      minPrice,
      maxPrice,
      categories,
      type,
      page = 1,
      limit = 10
    } = body;

    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      isConfirmed: true
    };

    if (search) {
     
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice);
      if (maxPrice) priceFilter.lte = parseInt(maxPrice);
      
      whereClause.price = priceFilter;
    }

    if (categories && categories.length > 0) {
     
      whereClause.category = {
        in: categories
      };
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    
    if (type === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (type === 'discount') {
     
      whereClause.discount = { gt: 0 };
      orderBy = { discount: 'desc' };
    } else if (type === 'popular') {
      orderBy = { title: 'asc' };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit
    });

    const total = await prisma.product.count({
      where: whereClause
    });

    const formattedProducts = products.map(product => {
      let imageUrls: string[] = [];
      if (product.images && product.images.length > 0) {
        imageUrls = product.images;
      } else if (product.image) {
        imageUrls = [product.image];
      }

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        description: product.comment,
        size: product.size,
        category: product.category,
        subcategory: product.subcategory,
        isConfirmed: product.isConfirmed,
        quantity: product.quantity,
        reserved: product.reserved,
        barcode: product.barcode,
        images: imageUrls,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products via POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении товаров',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}
