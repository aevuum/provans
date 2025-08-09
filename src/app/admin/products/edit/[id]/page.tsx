import { redirect } from 'next/navigation';

export default function RedirectToCanonicalEdit({ params }: { params: { id: string } }) {
  redirect(`/admin/products/${params.id}/edit`);
}
