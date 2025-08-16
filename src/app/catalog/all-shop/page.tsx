import { redirect } from 'next/navigation';

export default function AllShopRedirect() {
	redirect('/catalog/all');
}
