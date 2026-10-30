import type { Product } from '../interfaces';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
        300 x 300
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.sku && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-mono mb-1">
              SKU: {product.sku}
            </span>
          )}
          
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {product.stock}
          </span>
        </div>
      </div>
    </div>
  );
};