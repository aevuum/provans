'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  price: number;
  quantity: number;
  reserved: number;
  category?: string;
  image?: string;
}

export default function StockManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ quantity: number; reserved: number }>({
    quantity: 0,
    reserved: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=10000');
      const result = await response.json();
      if (result.success && result.data.products) {
        setProducts(result.data.products);
      }
    } catch (_error) {
      console.error('Error fetching products:', _error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (product: Product) => {
    setEditingProduct(product.id);
    setEditValues({
      quantity: product.quantity,
      reserved: product.reserved
    });
  };

  const handleEditCancel = () => {
    setEditingProduct(null);
    setEditValues({ quantity: 0, reserved: 0 });
  };

  const handleEditSave = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: editValues.quantity,
          reserved: editValues.reserved
        })
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setProducts(products.map(product => 
          product.id === productId 
            ? { ...product, quantity: editValues.quantity, reserved: editValues.reserved }
            : product
        ));
        setEditingProduct(null);
      } else {
        alert('Ошибка при обновлении остатков');
      }
    } catch (_error) {
      console.error('Error updating stock:', _error);
      alert('Ошибка при обновлении остатков');
    }
  };

  const adjustQuantity = (delta: number) => {
    setEditValues(prev => ({
      ...prev,
      quantity: Math.max(0, prev.quantity + delta)
    }));
  };

  const adjustReserved = (delta: number) => {
    setEditValues(prev => ({
      ...prev,
      reserved: Math.max(0, prev.reserved + delta)
    }));
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (quantity: number, reserved: number) => {
    const available = quantity - reserved;
    if (available <= 0) return { status: 'out', color: 'text-red-600', text: 'Нет в наличии' };
    if (available <= 5) return { status: 'low', color: 'text-yellow-600', text: 'Мало' };
    return { status: 'ok', color: 'text-green-600', text: 'В наличии' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Управление остатками товаров
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    На складе
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Зарезервировано
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Доступно
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const isEditing = editingProduct === product.id;
                  const stockStatus = getStockStatus(product.quantity, product.reserved);
                  const available = product.quantity - product.reserved;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.image && (
                            <Image
                              src={product.image}
                              alt={product.title}
                              width={40}
                              height={40}
                              className="rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => adjustQuantity(-1)}
                              className="p-1 rounded text-gray-400 hover:text-gray-600"
                            >
                              <FaMinus size={12} />
                            </button>
                            <input
                              type="number"
                              value={editValues.quantity}
                              onChange={(e) => setEditValues(prev => ({
                                ...prev,
                                quantity: Math.max(0, parseInt(e.target.value) || 0)
                              }))}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                              min="0"
                            />
                            <button
                              onClick={() => adjustQuantity(1)}
                              className="p-1 rounded text-gray-400 hover:text-gray-600"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900">{product.quantity}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => adjustReserved(-1)}
                              className="p-1 rounded text-gray-400 hover:text-gray-600"
                            >
                              <FaMinus size={12} />
                            </button>
                            <input
                              type="number"
                              value={editValues.reserved}
                              onChange={(e) => setEditValues(prev => ({
                                ...prev,
                                reserved: Math.max(0, parseInt(e.target.value) || 0)
                              }))}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                              min="0"
                              max={editValues.quantity}
                            />
                            <button
                              onClick={() => adjustReserved(1)}
                              className="p-1 rounded text-gray-400 hover:text-gray-600"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900">{product.reserved}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? editValues.quantity - editValues.reserved : available}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSave(product.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditStart(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Товары не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
