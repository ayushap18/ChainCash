import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, GameAsset } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (asset: GameAsset, quantity?: number) => void;
  removeItem: (assetId: string) => void;
  updateQuantity: (assetId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (asset: GameAsset, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.asset.id === asset.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.asset.id === asset.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { asset, quantity }] });
        }
      },

      removeItem: (assetId: string) => {
        set({ items: get().items.filter((item) => item.asset.id !== assetId) });
      },

      updateQuantity: (assetId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(assetId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.asset.id === assetId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.asset.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'chaincash-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
