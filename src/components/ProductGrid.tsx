import { useEffect } from 'react';
import { useProductStore } from '../store';
import { ProductCard } from './ProductCard';

export const ProductGrid = () => {
  const { products = [], isLoading, error, page, hasMore, fetchProducts, setPage } = useProductStore();

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  const safeProducts = Array.isArray(products) ? products : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-center my-8">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {safeProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No products found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {safeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
        <div className="flex flex-1 justify-between items-center">
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{page}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center rounded-md px-3 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="relative inline-flex items-center rounded-md px-3 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};