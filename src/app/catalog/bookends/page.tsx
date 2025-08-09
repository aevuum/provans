'use client';

import { CatalogPage } from '@/app/components/CatalogPage';

export default function BookendsPage() {
  return (
    <CatalogPage 
      category="bookends"
      title="Книгодержатели"
      description="Стильные и практичные книгодержатели для организации вашей домашней библиотеки."
      showCategoryFilter={false}
    />
  );
}
