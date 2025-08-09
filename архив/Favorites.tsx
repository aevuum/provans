// //app/components/Favorites.tsx
// 'use client';

// import { FaHeart, FaTimes, FaShoppingBag } from 'react-icons/fa';
// import { Product } from '@/types';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useAppDispatch } from '@/lib/hooks';
// import { addToCart } from '@/lib/features/cart/cartSlice';
// import Image from 'next/image';

// interface FavoritesProps {
//   favorites: Product[];
//   toggleFavorite: (product: Product) => void;
//   addToCart: (product: Product) => void;
//   showFavorites: boolean;
//   setShowFavorites: (show: boolean) => void;
// }

// export const Favorites = ({
//   favorites,
//   toggleFavorite,
//   showFavorites,
//   setShowFavorites
// }: FavoritesProps) => {
//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   const handleAddToCart = (product: Product) => {
//     dispatch(addToCart(product));
//   };

//   const handleProductClick = (productId: number) => {
//     setShowFavorites(false);
//     router.push(`/product/${productId}`);
//   };

//   if (!showFavorites) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
//       <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-bold">Избранное</h2>
//           <button 
//             className="text-gray-500 hover:text-gray-700"
//             onClick={() => setShowFavorites(false)}
//           >
//             <FaTimes className="w-5 h-5" />
//           </button>
//         </div>
        
//         <p className="mb-4">{favorites.length} {favorites.length === 1 ? 'товар' : 'товара'}</p>
        
//         {favorites.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="mb-4">Список избранного пуст</p>
//             <Link 
//               href="/catalog" 
//               className="text-blue-500 hover:underline"
//               onClick={() => setShowFavorites(false)}
//             >
//               Перейти в каталог
//             </Link>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {favorites.map(item => (
//               <div key={item.id} className="border-b py-4 flex">
//                 <button 
//                   className="flex-shrink-0"
//                   onClick={() => handleProductClick(item.id)}
//                 >
//                   <div className="relative w-20 h-20 mr-4">
//                     <Image
//                       src={item.image}
//                       alt={item.title}
//                       fill
//                       className="object-contain"
//                       sizes="(max-width: 640px) 80px, 100px"
//                     />
//                   </div>
//                 </button>
//                 <div className="flex-1">
//                   <button 
//                     className="text-left font-medium hover:text-blue-500"
//                     onClick={() => handleProductClick(item.id)}
//                   >
//                     {item.title}
//                   </button>
//                   <div className="flex justify-between items-center mt-2">
//                     <span className="font-bold">{item.price} ₽</span>
//                     <div className="flex space-x-2">
//                       <button 
//                         className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center"
//                         onClick={() => handleAddToCart(item)}
//                       >
//                         <FaShoppingBag className="mr-1" />
//                         Купить
//                       </button>
//                       <button 
//                         className="text-red-500 p-1"
//                         onClick={() => toggleFavorite(item)}
//                       >
//                         <FaHeart />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };