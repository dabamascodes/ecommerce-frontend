import { useCartStore } from '../store';
import type { Product } from '../interfaces';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between bg-white">
      <div>
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-48 object-cover rounded-md mb-3"
        />
        <span className="text-xs text-gray-400 font-mono">SKU: {product.sku}</span>
        <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 my-2">{product.description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
        <div>
          <span className="text-xl font-black text-gray-900">${product.price}</span>
          <span className="block text-xs text-gray-500">Stock: {product.stock}</span>
        </div>

        <button
          onClick={handleAddToCart}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};