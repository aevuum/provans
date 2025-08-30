// import { redirect } from 'next/navigation';

import CatalogPage from "@/components/CatalogPage";

// export default function CandleHoldersPage() {
//   redirect('/catalog/candlesticks');
// }


export default function BookendsPage() {
  return (
    <CatalogPage
      category="bookends"
      title="Книгодержатели"
  // description="Стильные и практичные книгодержатели для организации вашей домашней библиотеки."
      showCategoryFilter={false}
    />
  );
}
