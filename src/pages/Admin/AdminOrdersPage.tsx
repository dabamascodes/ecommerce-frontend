import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../services';
import type { Order } from '../../interfaces';
import { OrderStatus } from '../../interfaces';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    orderId: string;
    currentStatus: string;
  }>({
    isOpen: false,
    orderId: '',
    currentStatus: 'pending',
  });
  const [newStatus, setNewStatus] = useState<string>('pending');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<any>('/orders/admin/all', {
        params: { limit: 500, offset: 0 },
      });

      const data = response.data;
      const ordersList = Array.isArray(data) ? data : data.orders || [];
      setOrders(ordersList);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load platform orders';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getCustomerDisplayName = (user?: any) => {
    if (!user) return 'Guest / Unnamed';
    return user.fullName || user.name || user.email;
  };

  const filteredOrders = orders.filter((order) => {
    const orderId = order.id.toLowerCase();
    const userEmail = (order as any).user?.email?.toLowerCase() || '';
    const customerName = getCustomerDisplayName((order as any).user).toLowerCase();
    const status = order.status.toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      orderId.includes(search) ||
      userEmail.includes(search) ||
      customerName.includes(search) ||
      status.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleOpenStatusModal = (order: Order) => {
    setStatusModal({
      isOpen: true,
      orderId: order.id,
      currentStatus: order.status,
    });
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await api.patch(`/orders/${statusModal.orderId}/status`, {
        status: newStatus,
      });
      toast.success(`Order status updated to "${newStatus}" successfully`);
      setStatusModal({ isOpen: false, orderId: '', currentStatus: 'pending' });
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update order status';
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case OrderStatus.PAID:
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED:
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERED:
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case OrderStatus.CANCELLED:
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="p-6 max-w-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
          <p className="text-gray-500 text-sm">
            Monitor customer orders, track fulfillment statuses, and inspect purchase records.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search by order ID, email, customer, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600 font-medium">
          Showing <span className="text-gray-900 font-bold">{paginatedOrders.length}</span> of{' '}
          <span className="text-gray-900 font-bold">{filteredOrders.length}</span> filtered orders (Total loaded: {orders.length})
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500 font-medium">Loading store orders...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-4">Order ID / Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Items Count</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {paginatedOrders.map((order) => {
                  const numericTotal = Number(order.total) || 0;
                  const dateStr = new Date(order.createdAt).toLocaleDateString();
                  const orderUser = (order as any).user;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-gray-900">{order.id}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{dateStr}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">{getCustomerDisplayName(orderUser)}</div>
                        <div className="text-xs text-gray-500">{orderUser?.email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        ${numericTotal.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {order.orderItems?.length || 0} items
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer text-xs"
                        >
                          Change Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      No orders matched your criteria.
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

      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Order Details</h3>
                <p className="text-xs font-mono text-gray-500">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Customer Info</h4>
                  <p className="font-semibold text-gray-900">{getCustomerDisplayName((selectedOrder as any).user)}</p>
                  <p className="text-sm text-gray-600">{(selectedOrder as any).user?.email}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Shipping Address</h4>
                  {selectedOrder.shippingAddress ? (
                    <p className="text-sm text-gray-700">
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No shipping address recorded</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Purchased Items</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Product</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.orderItems?.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-4 font-medium text-gray-900">
                            {item.product?.name || (item.product as any)?.title || 'Product Item'}
                            <div className="text-xs text-gray-400 font-mono">SKU: {item.product?.sku || 'N/A'}</div>
                          </td>
                          <td className="py-2.5 px-4 text-center text-gray-700">{item.quantity}</td>
                          <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                            ${Number(item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-${Number(selectedOrder.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${Number(selectedOrder.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Update Order Status</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select the new fulfillment status for order <span className="font-mono text-xs font-semibold text-gray-800">{statusModal.orderId}</span>
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModal({ isOpen: false, orderId: '', currentStatus: 'pending' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {updatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};