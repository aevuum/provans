import { redirect } from 'next/navigation';

export default function PromotionsPage() {
  const target = encodeURI('/catalog/акции');
  redirect(target);
}
