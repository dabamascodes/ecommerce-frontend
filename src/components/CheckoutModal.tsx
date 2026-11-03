import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { checkoutService } from '../services';
import { PaymentForm } from './PaymentForm';
import { useCartStore } from '../store';
import type { Address } from '../interfaces';
import { logger } from '../utils/logger';
import { toast } from 'sonner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  total?: number;
}

export const CheckoutModal = ({ isOpen, onClose, orderId: existingOrderId, total: existingTotal }: CheckoutModalProps) => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart, closeCart } = useCartStore();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(existingOrderId || null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCurrentOrderId(existingOrderId || null);

      if (!existingOrderId) {
        checkoutService
          .getUserAddresses()
          .then((data) => {
            setAddresses(data);
            if (data.length > 0 && !selectedAddressId) {
              const defaultAddr = data.find((a) => a.isDefault) || data[0];
              setSelectedAddressId(defaultAddr.id);
            }
          })
          .catch((err) => {
            const msg = err.message || 'Could not load shipping addresses';
            setError(msg);
            toast.error(msg);
          });
      }
    }
  }, [isOpen, existingOrderId]);

  const handleFullReset = async () => {
    if (currentOrderId && !existingOrderId) {
      try {
        await checkoutService.cancelOrder(currentOrderId);
        toast.info('Order cancelled');
      } catch (err: any) {
        logger.error('Failed to cancel order on backend', err);
      }
    }
    setClientSecret(null);
    setCurrentOrderId(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleProceedToPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      let orderId = currentOrderId;

      if (!orderId) {
        if (!selectedAddressId) {
          setError('Please select a shipping address');
          toast.warning('Please select a shipping address');
          setLoading(false);
          return;
        }
        const order = await checkoutService.createOrder(cart, selectedAddressId);
        orderId = order.id;
        setCurrentOrderId(orderId);
      }
      
      if (!orderId) {
        throw new Error('Could not resolve order ID');
      }

      const paymentIntentData = await checkoutService.createPaymentIntent(orderId);

      logger.info('Payment Intent Ready', paymentIntentData);
      setClientSecret(paymentIntentData.clientSecret);
    } catch (err: any) {
      const msg = err.message || 'Failed to process checkout';
      setError(msg);
      toast.error(msg);
      logger.error('Checkout error', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (!existingOrderId) {
      clearCart();
    }
    setClientSecret(null);
    setCurrentOrderId(null);
    onClose();
    closeCart();
    navigate('/orders');
  };

  const displayTotal = existingTotal !== undefined ? existingTotal : getTotalPrice();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden z-10">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {clientSecret ? 'Complete Payment' : existingOrderId ? 'Retry Payment' : 'Checkout Summary'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {clientSecret ? (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: { theme: 'stripe' },
              }}
            >
              <PaymentForm 
                onSuccess={handlePaymentSuccess} 
                onCancel={handleFullReset} 
              />
            </Elements>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-xs">
                  {error}
                </div>
              )}

              {existingOrderId ? (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-xs text-indigo-800 space-y-1">
                  <p className="font-semibold">Retrying payment for Order #{existingOrderId.substring(0, 8)}...</p>
                  <p className="text-indigo-600">Click below to open the secure payment gateway.</p>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Shipping Address</h4>
                  {addresses.length === 0 ? (
                    <p className="text-xs text-gray-500">No shipping addresses found.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedAddressId === addr.id 
                              ? 'border-indigo-600 bg-indigo-50/50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="shippingAddress"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="text-xs">
                            <p className="font-semibold text-gray-900">{addr.street}</p>
                            <p className="text-gray-600">{addr.city}, {addr.state} {addr.zipCode}</p>
                            <p className="text-gray-500">{addr.country}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!existingOrderId && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Order Items</h4>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-xs text-gray-700 border-b border-gray-100 pb-2">
                        <span className="truncate max-w-60">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-medium">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Total to Pay</span>
                <span className="text-lg font-bold text-indigo-600">${Number(displayTotal).toFixed(2)}</span>
              </div>

              <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleFullReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || (!existingOrderId && addresses.length === 0)}
                  onClick={handleProceedToPayment}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {loading ? 'Processing...' : existingOrderId ? 'Proceed to Payment' : currentOrderId ? 'Resume Payment' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};