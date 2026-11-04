import { useEffect, useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { api } from '../../services';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  price: number | string;
  stock: number;
  weight_kg?: number;
  sku: string;
  isActive: boolean;
  createdAt: string;
  category?: Category;
  categoryId?: string;
  sizes?: string[];
  gender?: string | string[];
}

interface ConfirmState {
  isOpen: boolean;
  type: 'activate' | 'deactivate';
  productId: string;
  productName: string;
}

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    type: 'deactivate',
    productId: '',
    productName: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    weight_kg: '',
    categoryId: '',
    description: '',
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsRes, categoriesRes] = await Promise.all([
        api.get<any>('/products', { params: { limit: 500, offset: 0, includeInactive: true } }),
        api.get<any>('/categories').catch(() => ({ data: [] }))
      ]);
      
      const prodData = productsRes.data;
      const productsList = Array.isArray(prodData) ? prodData : prodData.products || prodData.data || [];
      setProducts(productsList);

      const catData = categoriesRes.data;
      const categoriesList = Array.isArray(catData) ? catData : catData.categories || catData.data || [];
      setCategories(categoriesList);

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load catalog data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCategoryDisplay = (product: Product): string => {
    if (product.category && typeof product.category === 'object') {
      return product.category.name || 'Unassigned';
    }
    return 'Unassigned';
  };

  const filteredProducts = products.filter((product) => {
    const rawName = product.name || product.title || '';
    const rawSku = product.sku || '';
    const rawDesc = product.description || '';
    const categoryName = getCategoryDisplay(product);
    
    const name = typeof rawName === 'string' ? rawName.toLowerCase() : String(rawName).toLowerCase();
    const sku = typeof rawSku === 'string' ? rawSku.toLowerCase() : String(rawSku).toLowerCase();
    const description = typeof rawDesc === 'string' ? rawDesc.toLowerCase() : String(rawDesc).toLowerCase();
    const category = categoryName.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return name.includes(search) || sku.includes(search) || category.includes(search) || description.includes(search);
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setFormData({
      name: '',
      sku: '',
      price: '',
      stock: '',
      weight_kg: '',
      categoryId: '',
      description: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    setFormData({
      name: product.name || product.title || '',
      sku: product.sku || '',
      price: String(product.price || ''),
      stock: String(product.stock ?? 0),
      weight_kg: product.weight_kg !== undefined ? String(product.weight_kg) : '',
      categoryId: product.category?.id || product.categoryId || '',
      description: product.description || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const payload: any = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : undefined,
        categoryId: formData.categoryId,
        description: formData.description.trim() || undefined,
      };

      if (isEditing && currentProductId) {
        await api.patch(`/products/${currentProductId}`, payload);
        toast.success(`Product "${formData.name}" updated successfully`);
      } else {
        await api.post('/products', payload);
        toast.success(`Product "${formData.name}" created successfully`);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Operation failed. Check fields.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const promptDeactivate = (id: string, name?: string) => {
    setConfirmState({
      isOpen: true,
      type: 'deactivate',
      productId: id,
      productName: name || 'this product',
    });
  };

  const promptActivate = (id: string, name?: string) => {
    setConfirmState({
      isOpen: true,
      type: 'activate',
      productId: id,
      productName: name || 'this product',
    });
  };

  const handleConfirmAction = async () => {
    const { type, productId, productName } = confirmState;
    try {
      if (type === 'deactivate') {
        await api.delete(`/products/${productId}`);
        toast.success(`Product "${productName}" deactivated`);
      } else {
        await api.patch(`/products/${productId}`, { isActive: true });
        toast.success(`Product "${productName}" activated`);
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${type} product`);
    } finally {
      setConfirmState({ isOpen: false, type: 'deactivate', productId: '', productName: '' });
    }
  };

  const exportToExcel = () => {
    if (filteredProducts.length === 0) return;

    const headers = ['ID', 'SKU', 'Product Name', 'Description', 'Price', 'Stock', 'Status', 'Category', 'Weight (kg)'];
    const rows = filteredProducts.map((p) => {
      const productName = p.name || p.title || '';
      const catDisplay = getCategoryDisplay(p);
      return [
        p.id,
        `"${p.sku || ''}"`,
        `"${String(productName).replace(/"/g, '""')}"`,
        `"${String(p.description || '').replace(/"/g, '""')}"`,
        Number(p.price) || 0,
        p.stock,
        p.isActive ? 'Active' : 'Inactive',
        `"${catDisplay}"`,
        p.weight_kg ?? 0
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `products_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Catalog exported to CSV');
  };

  return (
    <div className="p-6 max-w-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
          <p className="text-gray-500 text-sm">
            Manage store inventory, SKUs, active statuses, and export records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
            </svg>
            Export to Excel
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 cursor-pointer"
          >
            + Add New Product
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name, SKU, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600 font-medium">
          Showing <span className="text-gray-900 font-bold">{paginatedProducts.length}</span> of{' '}
          <span className="text-gray-900 font-bold">{filteredProducts.length}</span> filtered items (Total loaded: {products.length})
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500 font-medium">Loading catalog products...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-4">Product / Description / SKU</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Weight</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {paginatedProducts.map((product) => {
                  const productName = product.name || product.title || 'Untitled Product';
                  const numericPrice = Number(product.price) || 0;
                  const categoryName = getCategoryDisplay(product);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-gray-900">{productName}</div>
                        {product.description && (
                          <div className="text-xs text-gray-500 truncate mt-0.5" title={product.description}>
                            {product.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 font-mono mt-0.5">SKU: {product.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        ${numericPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            product.stock > 20
                              ? 'bg-green-100 text-green-800'
                              : product.stock > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            product.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {categoryName}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">
                        {product.weight_kg ? `${product.weight_kg} kg` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs"
                        >
                          Edit
                        </button>
                        {product.isActive ? (
                          <button
                            onClick={() => promptDeactivate(product.id, productName)}
                            className="text-amber-600 hover:text-amber-800 font-semibold cursor-pointer text-xs"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => promptActivate(product.id, productName)}
                            className="text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer text-xs"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No products matched your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page <span className="font-semibold text-gray-700">{currentPage}</span> of <span className="font-semibold text-gray-700">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Mechanical Keyboard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KB-KEY-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.0"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional product description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 animate-in fade-in zoom-in duration-200 text-center">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              confirmState.type === 'deactivate' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {confirmState.type === 'deactivate' ? 'Deactivate Product' : 'Activate Product'}
            </h3>
            
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to {confirmState.type} <span className="font-semibold text-gray-800">"{confirmState.productName}"</span>?
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setConfirmState({ isOpen: false, type: 'deactivate', productId: '', productName: '' })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer w-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium cursor-pointer w-full ${
                  confirmState.type === 'deactivate' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};