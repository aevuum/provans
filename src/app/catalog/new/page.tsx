import { redirect } from 'next/navigation';

export default function NewRedirectPage() {
  const target = encodeURI('/catalog/новинки');
  redirect(target);
}
