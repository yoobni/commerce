'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CART_COUNT_KEY = 'ravi:cart_count';

interface CartContextValue {
  cartCount: number;
  setCartCount: (count: number) => void;
}

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  setCartCount: () => {},
});

/**
 * Minimal cart count context — backed by localStorage.
 * Full cart state management (items, totals) will be added with the cart feature.
 * Other components call setCartCount() when cart items change.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCountState] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(CART_COUNT_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 0) setCartCountState(parsed);
    }
  }, []);

  function setCartCount(count: number) {
    const next = Math.max(0, count);
    setCartCountState(next);
    localStorage.setItem(CART_COUNT_KEY, String(next));
  }

  return (
    <CartContext.Provider value={{ cartCount, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartCount(): CartContextValue {
  return useContext(CartContext);
}
