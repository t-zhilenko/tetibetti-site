"use client";

import {useEffect, useState} from "react";
import CartDrawer from "@/components/cart/CartDrawer";
import {CartContext, type CartItem} from "@/components/cart/CartContext";

type CartProviderProps = {
  children: React.ReactNode;
};

const CART_STORAGE_KEY = "tetibetti_cart_v1";

const sanitizeCartItems = (value: unknown): CartItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduped = new Map<string, CartItem>();

  value.forEach((entry) => {
    if (!entry || typeof entry !== "object") {
      return;
    }
    const raw = entry as Partial<CartItem>;
    const slug = typeof raw.slug === "string" ? raw.slug : "";
    if (!slug) {
      return;
    }

    deduped.set(slug, {
      slug,
      title: typeof raw.title === "string" ? raw.title : slug,
      subtitle: typeof raw.subtitle === "string" ? raw.subtitle : undefined,
      imageSrc: typeof raw.imageSrc === "string" ? raw.imageSrc : undefined,
      price: typeof raw.price === "number" && Number.isFinite(raw.price) ? raw.price : 0,
      currency: typeof raw.currency === "string" && raw.currency ? raw.currency : "USD",
      quantity: 1,
    });
  });

  return Array.from(deduped.values());
};

const loadStoredCartItems = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeCartItems(parsed);
  } catch {
    return [];
  }
};

export default function CartProvider({children}: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  useEffect(() => {
    setItems(loadStoredCartItems());
    setHasHydratedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedStorage) {
      return;
    }
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage write failures
    }
  }, [hasHydratedStorage, items]);

  const addItem = (incoming: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.slug === incoming.slug);
      if (existing) {
        return prev.map((item) =>
          item.slug === incoming.slug
            ? {
                ...item,
                ...incoming,
                quantity: 1,
              }
            : item
        );
      }
      return [...prev, {...incoming, quantity: 1}];
    });
    setIsOpen(true);
  };

  const removeItem = (slug: string) => {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => {
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        itemCount,
        addItem,
        removeItem,
        clearCart,
        openCart,
        closeCart,
      }}
    >
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}
