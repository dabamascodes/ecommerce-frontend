import { useState } from 'react';
import { useCartStore } from '../store';
import { checkoutService } from '../services';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const { cart, clearCart, closeCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated. Please log in first.');
      }

      const order = await checkoutService.createOrder(cart);
      const orderId = order.id || order.orderId;

      const paymentData = await checkoutService.createPaymentIntent(orderId);

      if (paymentData.url) {
        window.location.href = paymentData.url;
      } else {
        alert('Order completed successfully via simulation! 🎉');
        clearCart();
        onClose();
        closeCart();
      }
    } catch (err: any) {
      setError(err.message || 'Error processing checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Checkout</h3>
        <p className="text-sm text-gray-500 mb-6">
          You are about to place an order for {cart.reduce((acc, item) => acc + item.quantity, 0)} item(s).
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            disabled={loading}
            onClick={handleCheckout}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Processing...' : 'Proceed to Payment 🚀'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};