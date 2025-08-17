'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Product } from '@/types/index'

interface PageProps {
	params: Promise<{ id: string }>
}

export default function AdminProductViewPage({ params }: PageProps) {
	const { data: session } = useSession()
	const router = useRouter()
	const [product, setProduct] = useState<Product | null>(null)
	const [loading, setLoading] = useState(true)
	const [id, setId] = useState<string>('')

	useEffect(() => {
		async function getParams() {
			const resolvedParams = await params
			setId(resolvedParams.id)
		}
		getParams()
	}, [params])

	useEffect(() => {
		if (!id) return

		async function fetchProduct() {
			try {
				const response = await fetch(`/api/admin/products/${id}`)
				if (response.ok) {
					const data = await response.json()
					setProduct(data)
				}
			} catch (error) {
				console.error('Error fetching product:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchProduct()
	}, [id])

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!session || (session.user as any)?.role !== 'admin') {
		router.push('/admin')
		return null
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	if (!product) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Товар не найден</h1>
					<button
						onClick={() => router.back()}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Назад
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Заголовок */}
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-3xl font-bold text-gray-900">
							Просмотр товара
						</h1>
						<div className="space-x-2">
							<button
								onClick={() => router.push(`/admin/products/${id}/edit`)}
								className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
							>
								Редактировать
							</button>
							<button
								onClick={() => router.back()}
								className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
							>
								Назад
							</button>
						</div>
					</div>

					{/* Карточка товара */}
					<div className="bg-white rounded-lg shadow-md overflow-hidden">
						<div className="p-6">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								{/* Изображение */}
								<div>
									{product.image && (
										<Image
											src={product.image}
											alt={product.title}
											width={400}
											height={400}
											className="w-full h-auto rounded-lg"
										/>
									)}
									{product.images && product.images.length > 0 && (
										<div className="grid grid-cols-3 gap-2 mt-4">
											{product.images.map((img, index) => (
												<Image
													key={index}
													src={img}
													alt={`${product.title} ${index + 1}`}
													width={120}
													height={120}
													className="rounded border"
												/>
											))}
										</div>
									)}
								</div>

								{/* Информация */}
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">ID</label>
										<p className="text-lg">{product.id}</p>
									</div>
                  
									<div>
										<label className="block text-sm font-medium text-gray-700">Название</label>
										<p className="text-lg font-semibold">{product.title}</p>
									</div>
                  
									<div>
										<label className="block text-sm font-medium text-gray-700">Цена</label>
										<p className="text-lg text-green-600 font-bold">{product.price.toLocaleString('ru-RU')} ₽</p>
									</div>
                  
									{product.size && (
										<div>
											<label className="block text-sm font-medium text-gray-700">Размер</label>
											<p className="text-lg">{product.size}</p>
										</div>
									)}
                  
									  {/* Поля material и country отсутствуют в типе Product */}
                  
									{product.barcode && (
										<div>
											<label className="block text-sm font-medium text-gray-700">Штрихкод</label>
											<p className="text-lg font-mono">{product.barcode}</p>
										</div>
									)}
                  
									<div>
										<label className="block text-sm font-medium text-gray-700">Статус</label>
										<span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
											product.isConfirmed 
												? 'bg-green-100 text-green-800' 
												: 'bg-yellow-100 text-yellow-800'
										}`}>
											{product.isConfirmed ? 'Подтвержден' : 'На модерации'}
										</span>
									</div>
                  
									{product.comment && (
										<div>
											<label className="block text-sm font-medium text-gray-700">Комментарий</label>
											<p className="text-lg">{product.comment}</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
