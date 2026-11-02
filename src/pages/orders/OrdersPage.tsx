import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2, XCircle, Truck, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { ordersService } from '../../services/orders.service';
import { OrderStatus, type Order } from '../../interfaces';
import { CheckoutModal } from '../../components/CheckoutModal';
import { toast } from 'sonner';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getMyOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const updatedOrder = await ordersService.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? updatedOrder : ord))
      );
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not cancel order');
    }
  };

  const handlePayNow = (order: Order) => {
    setSelectedOrderForPayment(order);
    setIsCheckoutOpen(true);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> PAID
          </span>
        );
      case OrderStatus.PENDING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> PENDING
          </span>
        );
      case OrderStatus.CANCELLED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3 mr-1" /> {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">No orders found</h2>
        <p className="text-gray-500 mt-1">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const isPending = order.status === OrderStatus.PENDING || String(order.status).toLowerCase() === 'pending';

          return (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-gray-800">
                      #{order.id.substring(0, 8)}...
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-base font-bold text-gray-900">${order.total}</p>
                  </div>

                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-white space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Items in this order
                  </h4>

                  <div className="divide-y divide-gray-100">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title || item.product.name}
                              className="w-12 h-12 object-cover rounded-md border border-gray-100"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {item.product?.title || item.product?.name || 'Product'}
                            </p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {order.shippingAddress && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-semibold text-gray-700 mb-1">Shipping Address:</p>
                        <p className="text-gray-600">
                          {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal:</span>
                        <span>${order.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Tax (16%):</span>
                        <span>${order.tax}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-200">
                        <span>Total:</span>
                        <span>${order.total}</span>
                      </div>
                    </div>
                  </div>

                  {isPending && (
                    <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-yellow-50/50 p-3 rounded-lg mt-4">
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-2 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                      >
                        Cancel Order
                      </button>
                      <button
                        onClick={() => handlePayNow(order)}
                        className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isCheckoutOpen && selectedOrderForPayment && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedOrderForPayment(null);
            fetchOrders();
          }}
          orderId={selectedOrderForPayment.id}
          total={selectedOrderForPayment.total}
        />
      )}
    </div>
  );
};