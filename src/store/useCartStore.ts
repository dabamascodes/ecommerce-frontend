import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../interfaces';

interface CartState {
  cart: CartItem[];
  isOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addToCart: (product, quantity = 1, size) => {
        const { cart } = get();
        const existingItemIndex = cart.findIndex(
          (item) => item.product.id === product.id && item.selectedSize === size
        );

        if (existingItemIndex > -1) {
          const updatedCart = [...cart];
          updatedCart[existingItemIndex].quantity += quantity;
          set({ cart: updatedCart });
        } else {
          set({ cart: [...cart, { product, quantity, selectedSize: size }] });
        }
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().cart.reduce(
          (total, item) => total + Number(item.product.price) * item.quantity,
          0
        );
      },
    }),
    {
      name: 'shopping-cart-storage',
    }
  )
);