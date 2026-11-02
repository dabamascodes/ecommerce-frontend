import { useCartStore } from '../store';
import { CartDrawer } from './CartDrawer';

export const Navbar = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-indigo-600">Store</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
              Catalog
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors border border-gray-200 rounded-md hover:border-gray-300 cursor-pointer"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              <span>Cart</span>

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
};