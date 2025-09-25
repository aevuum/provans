import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlogCard from "../BlogCard";
import { getPostBySlug, getRelatedPosts, getAllPosts } from "../data";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
	return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
	const p = await params;
	const post = getPostBySlug(p.slug);
	return {
		title: post ? `${post.title} — Блог` : "Статья — Блог",
		description: post?.description ?? post?.excerpt,
	};
}

export default async function BlogArticle({ params }: { params: Promise<Params> }) {
	const p = await params;
	const post = getPostBySlug(p.slug);
	if (!post) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-12">
				<h1 className="text-2xl font-semibold">Статья не найдена</h1>
				<p className="mt-2 text-neutral-600">Возможно, она была перемещена или удалена.</p>
				<div className="mt-6">
					<Link className="text-neutral-900 underline" href="/blog">
						Назад в блог
					</Link>
				</div>
			</div>
		);
	}

	const related = getRelatedPosts(post.slug, post.category);

	return (
		<article className="mx-auto max-w-[1400px] px-3 pb-12 lg:px-6">
				<div className="relative mx-auto mb-6 mt-6 h-64 w-full overflow-hidden rounded-xl sm:h-80 md:mt-10">
					{post.showImages !== false ? (
						<>
							<Image src={post.coverImage} alt={post.title} fill className="object-cover" priority={false} />
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
								<h1 className="absolute bottom-4 left-0 right-0 px-4 text-center text-2xl sm:text-3xl section-heading text-white">
								{post.title}
							</h1>
						</>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-neutral-100">
							<h1 className="px-4 text-center text-2xl sm:text-3xl section-heading text-neutral-900">{post.title}</h1>
						</div>
					)}
				</div>

			<div className="mt-2 mb-6 flex items-center justify-start gap-2 text-sm text-neutral-600">
				<span>{post.category}</span>
				<span>•</span>
				<time dateTime={post.date}>{new Date(post.date).toLocaleDateString("ru-RU")}</time>
			</div>

			{/* Контент статьи */}
			<div className="bg-[#F5F1E9] p-6 rounded-lg">
					{post.content ? (
						<div className="prose prose-neutral max-w-none lg:prose-lg">
							<ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
						</div>
					) : (
						<div className="prose prose-neutral max-w-none lg:prose-lg">
							{post.sections.map((s) => {
								// Объединяем paragraphs и bullets в markdown
								const bullets = s.bullets && s.bullets.length > 0 ? `\n\n${s.bullets.map(b => `- ${b}`).join("\n")}` : "";
								const paragraphs = s.paragraphs.map(p => p).join("\n\n");
								const md = `${s.heading ? `## ${s.heading}\n\n` : ""}${paragraphs}${bullets}`;
								return (
									<section key={s.id} className="mb-10 last:mb-0">
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											components={{
												strong: ({node, ...props}) => <strong className="font-semibold text-neutral-900" {...props} />,
												li: ({node, ...props}) => <li className="pl-1 marker:text-neutral-700" {...props} />,
												h2: ({node, ...props}) => <h2 className="mt-8 mb-4 text-xl font-semibold tracking-tight" {...props} />,
												p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
											}}
										>
											{md}
										</ReactMarkdown>
										{post.showImages !== false && s.images && s.images.length > 0 && (
											<div className="mt-6 mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
												{s.images.map((src, i) => (
													<div key={i} className="relative h-48 w-full overflow-hidden rounded-lg sm:h-56">
														<Image src={src} alt="Иллюстрация" fill className="object-cover" />
													</div>
												))}
											</div>
										)}
									</section>
								);
							})}
						</div>
					)}

					{/* Кнопка "Назад в блог" вынесена ниже страницы, чтобы не дублировать */}
			</div>

			{/* Низ страницы: «Назад» и Похожие статьи в одну линию */}
			<div className="mt-8">
				<Link
					href="/blog"
					className="inline-block rounded-md px-4 py-2 text-sm text-white bg-[#b07d62] hover:bg-[#94614b]"
				>
					Назад в блог
				</Link>
			</div>

			{related.length > 0 && (
				<section className="mt-10">
					<h3 className="mb-4 text-lg font-semibold">Похожие статьи</h3>
					<div className="flex flex-nowrap gap-4">
						{related.slice(0, 3).map((p, i) => (
							<div
								key={p.slug}
								className={
									i === 0
										? "flex-1 min-w-0"
										: i === 1
										? "flex-1 min-w-0 hidden md:block"
										: "flex-1 min-w-0 hidden lg:block"
								}
							>
								<BlogCard post={p} variant="compact" className="h-full" />
							</div>
						))}
					</div>
				</section>
			)}
		</article>
	);
}

