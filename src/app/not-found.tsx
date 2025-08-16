import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-3xl font-bold mb-2">Страница не найдена</h1>
        <p className="text-gray-600 mb-6">Возможно, страница была перемещена или удалена.</p>
  <Link href="/" className="inline-block bg-[#B8835A] text-white px-6 py-3 rounded-lg hover:bg-[#9d6e47] transition-colors">На главную</Link>
      </div>
    </div>
  );
}
