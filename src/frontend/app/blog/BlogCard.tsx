"use client";
// using native img for card thumbnails — keeps layout stable and avoids Next.js image _client_ loading behaviors here
import Link from "next/link";
import { type BlogPost } from "./types";
import { SafeImage } from '@/components/SafeImage';

type Props = {
	post: BlogPost;
	className?: string;
	variant?: "default" | "compact";
};

// Лёгкий fallback на случай отсутствия утилиты cn
function cx(...classes: Array<string | undefined>): string {
	return classes.filter(Boolean).join(" ");
}

export default function BlogCard({ post, className, variant = "default" }: Props) {
	const Container = ({ children }: { children: React.ReactNode }) => (
		<div
			className={cx(
				"group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md",
				className,
			)}
		>
			{children}
		</div>
	);

	return (
		<Container>
			<Link href={`/blog/${post.slug}`} className="block focus:outline-none" aria-label={post.title}>
				{/* Карточка как вертикальный флекс: верх — изображение (большая часть), низ — контент (меньшая часть) */}
				<div
					className={cx(
						"flex flex-col",
						// Use explicit heights (not min-height) so percentage-based children and `fill`
						// can reliably compute their size and the image can cover the parent.
						variant === "compact"
							? "h-[480px] sm:h-[520px] md:h-[560px]"
							: "h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px]",
					)}
				>
					{/* Изображение */}
					<div className={cx("relative overflow-hidden", variant === "compact" ? "flex-1" : "basis-[85%]")}> {/* фото доминирует */}
						{/* Use SafeImage with fill so the image absolutely covers the parent container */}
						<SafeImage
							src={post.coverImage}
							alt={post.title}
							fill
							priority={true}
							sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
							className="object-cover"
						/>
					</div>

					{/* Контентный блок */}
					<div
						className={cx(
							"flex items-end",
							variant === "compact"
								? "flex-none min-h-[80px] px-3 pb-2 pt-1 text-[13px]"
								: "flex-none pl-6 pr-6 pb-3 pt-2 min-h-[84px]",
						)}
					>
							<div>
							<div className={cx("mb-1 flex items-center gap-2 text-neutral-500", variant === "compact" ? "text-[12px]" : "text-sm")}> 
								<span>{post.category}</span>
								<span>•</span>
								<time dateTime={post.date}>{new Date(post.date).toLocaleDateString("ru-RU")}</time>
							</div>
							<h3 className={cx("text-lg font-medium text-neutral-900 sm:text-xl", variant === "compact" ? "mt-1" : "mt-2")}> 
						{post.title}
					</h3>
							<p className={cx("text-sm leading-6 text-neutral-700", variant === "compact" ? "mt-1" : "mt-2")}> 
						{post.excerpt}
					</p>
							<div className={cx("inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors group-hover:text-neutral-700", variant === "compact" ? "mt-2" : "mt-3")}> 
						<span>Подробнее</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							fill="currentColor"
							viewBox="0 0 16 16"
							className="transition-transform group-hover:translate-x-0.5"
						>
							<path d="M1 8a.75.75 0 0 1 .75-.75h10.69L9.22 4.03a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06l3.22-3.22H1.75A.75.75 0 0 1 1 8Z" />
						</svg>
					</div>
						</div>
					</div>
				</div>
			</Link>
		</Container>
	);
}

