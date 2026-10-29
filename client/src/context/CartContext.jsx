// ---------- CART CONTEXT ----------
// Holds the shopping cart. It is saved in localStorage so it survives a page refresh.
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// The same shoe in a different size/color is a different cart line, so the key includes all three
const lineKey = (productId, size, color) => `${productId}-${size}-${color}`;

export function CartProvider({ children }) {
  // Start with whatever was saved last time (or an empty cart)
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));

  // Every time the cart changes, save it again
  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);

  // Add a product. If the same line already exists, just increase its quantity.
  const addToCart = (product, size, color, qty = 1) => {
    const key = lineKey(product._id, size, color);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i));
      }
      return [...prev, {
        key, product: product._id, name: product.name, image: product.image,
        price: product.price, stock: product.stock, size, color, qty,
      }];
    });
  };

  const setQty = (key, qty) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i)));

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clearCart = () => setItems([]);

  // Totals worked out from the items
  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, setQty, removeItem, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}
