import type { Metadata } from "next";
import Link from "next/link";
import BlogCard from "./BlogCard";
import { getAllPosts, PER_PAGE } from "./data";
import type { BlogPost } from "./types";

export const metadata: Metadata = {
	title: "Блог о декоре и интерьере",
	description:
		"Современные идеи для дома: сервировка, декор на праздники, подарки и организация пространства.",
};

function getPageParam(searchParams: Record<string, string | string[] | undefined>): number {
	const raw = typeof searchParams.page === "string" ? searchParams.page : Array.isArray(searchParams.page) ? searchParams.page[0] : undefined;
	const n = raw ? Number(raw) : 1;
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
	const sp = await searchParams;
	const all = getAllPosts();
	const page = getPageParam(sp);
	const start = (page - 1) * PER_PAGE;
	const items: ReadonlyArray<BlogPost> = all.slice(start, start + PER_PAGE);
	const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));

	return (
		<div className="mx-auto max-w-[1840px] px-1 py-10 sm:px-2 md:px-3 lg:px-4">
			<h1 className="text-3xl md:text-4xl tracking-wider text-center mb-8 text-gray-800 section-heading">Блог</h1>

			{/* Сетка 1/2/3 колонки; уменьшенный зазор между карточками; без ограничения ширины внутреннего контейнера */}
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((post) => (
					<BlogCard key={post.slug} post={post} />
				))}
			</div>

			<nav className="mt-10 flex items-center justify-center gap-2 text-sm">
				<Pagination current={page} total={totalPages} />
			</nav>
		</div>
	);
}

function Pagination({ current, total }: { current: number; total: number }) {
	const pages = Array.from({ length: total }, (_, i) => i + 1);
	const PageLink = ({ p, label }: { p: number; label?: string }) => (
		<Link
			href={{ pathname: "/blog", query: p === 1 ? undefined : { page: String(p) } }}
			className={
				"min-w-8 rounded border px-3 py-1 text-center transition-colors " +
				(p === current ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-800 hover:bg-neutral-50")
			}
			aria-current={p === current ? "page" : undefined}
		>
			{label ?? p}
		</Link>
	);

	return (
		<div className="flex items-center gap-2">
			<PageLink p={Math.max(1, current - 1)} label="«" />
			{pages.map((p) => (
				<PageLink key={p} p={p} />
			))}
			<PageLink p={Math.min(total, current + 1)} label="»" />
		</div>
	);
}

