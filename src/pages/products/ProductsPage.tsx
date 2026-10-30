import { Navbar, ProductGrid, ProductSearch } from '../../components';

export const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600 mt-1">
            Explore our latest products and collections.
          </p>
        </div>

        <ProductSearch />
        <ProductGrid />
      </main>
    </div>
  );
};