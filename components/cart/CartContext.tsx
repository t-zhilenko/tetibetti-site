"use client";

import {createContext, useContext} from "react";

export type CartItem = {
  slug: string;
  title: string;
  subtitle?: string;
  imageSrc?: string;
  price: number;
  currency: string;
  quantity: number;
};

export type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
