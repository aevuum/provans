// Central fallback Prisma types for build stability.
// Prefer importing real Prisma types from @prisma/client when available.

export interface ProductMinimal {
  id: number;
  title: string;
  image?: string | null;
  images?: string[] | null;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  subcategory?: string | null;
  size?: string | null;
  quantity?: number | null;
  reserved?: number | null;
  category?: string | null;
  barcode?: string | null;
  comment?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  isConfirmed?: boolean;
}

export type ProductCreateData = Omit<ProductMinimal, 'id' | 'isConfirmed'> & {
  isConfirmed?: boolean;
  images?: string[];
  quantity?: number;
  reserved?: number;
};

export interface ProductSuggestion {
  id: number;
  title: string;
  price: number;
  category?: string | null;
}

export default {} as const;
