import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';
import { CheckoutModal } from './checkout';
import { checkAuthStatus, checkoutService } from '../services';
import { logger } from '../utils/logger';
import { useState } from 'react';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const {
    cart,
    isOpen,
    closeCart,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart,
    setCart,
  } = useCartStore();

  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && cart.length > 0) {
      setValidationMessage(null);

      if (localStorage.getItem('token')) {
        checkAuthStatus().catch(() => {});
      }

      checkoutService
        .validateCart(cart)
        .then((data) => {
          if (data && data.hasChanges) {
            if (data.updatedItems && data.updatedItems.length > 0) {
              setCart(data.updatedItems);
            }
            if (data.messages && data.messages.length > 0) {
              setValidationMessage(data.messages[0]);
            }
          }
        })
        .catch((err) => {
          logger.error('Failed to validate cart items', err);
        });
    }
  }, [isOpen]);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      localStorage.setItem('fromCheckout', 'true');
      closeCart();
      navigate('/register', { state: { fromCheckout: true } });
      return;
    }

    closeCart();
    openCheckout();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
            onClick={closeCart}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
                <button
                  onClick={closeCart}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {validationMessage && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-amber-800 text-xs flex items-center justify-between">
                  <span>⚠️ {validationMessage}</span>
                  <button
                    onClick={() => setValidationMessage(null)}
                    className="text-amber-600 hover:text-amber-800 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <p className="text-5xl mb-3">🛒</p>
                    <p className="font-medium text-gray-600">Your cart is empty.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Add some products to start shopping.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const imageUrl =
                      item.product.images && item.product.images.length > 0
                        ? item.product.images[0]
                        : 'https://via.placeholder.com/150';

                    return (
                      <div
                        key={`${item.product.id}-${item.selectedSize || 'default'}`}
                        className="flex items-center gap-4 border-b border-gray-100 pb-4"
                      >
                        <img
                          src={imageUrl}
                          alt={item.product.title || item.product.name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 truncate">
                            {item.product.title || item.product.name}
                          </h4>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                            ${item.product.price}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 space-y-3">
                  <div className="flex justify-between text-base font-semibold text-gray-900">
                    <span>Subtotal</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={clearCart}
                      className="w-1/3 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleCheckoutClick}
                      className="w-2/3 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
      />
    </>
  );
};