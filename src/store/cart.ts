import { create } from "zustand";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
};

type addToCartItem = Omit<CartItem, "qty">;

interface CartState {
  items: CartItem[];
  addToCart: (newItem: addToCartItem) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addToCart: (newItem) => {
    set((state) => {
      const duplicateItems = [...state.items];

      const existItemIndex = duplicateItems.findIndex(
        (Item) => Item.id === newItem.id,
      );

      if (existItemIndex === -1) {
        duplicateItems.push({
          id: newItem.id,
          name: newItem.name,
          imageUrl: newItem.imageUrl,
          price: newItem.price,
          qty: 1,
        });
      } else {
        const itemToUpdate = duplicateItems[existItemIndex];

        if (!itemToUpdate)
          return {
            ...state,
          };

        itemToUpdate.qty += 1;
      }

      return {
        ...state,
        items: duplicateItems,
      };
    });
  },
  clearCart: () => {
    set({ items: [] });
  },
}));
