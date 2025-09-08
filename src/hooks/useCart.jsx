import { useState, useMemo, useCallback } from "react";

export const useCart = () => {
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((productToAdd) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === productToAdd.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === productToAdd.id
            ? {
                ...item,
                qty: item.qty + productToAdd.qty,
                selectedToppings: [
                  ...item.selectedToppings,
                  ...productToAdd.selectedToppings,
                ],
              }
            : item
        );
      } else {
        return [...prev, productToAdd];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQtyInCart = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = Math.max(item.qty + delta, 0);
            if (newQty === 0) return null; // Akan difilter oleh .filter(Boolean)
            const newSelectedToppings = [...item.selectedToppings];
            if (delta > 0) {
              newSelectedToppings.push(""); // Tambah slot topping kosong
            } else if (newSelectedToppings.length > newQty) {
              newSelectedToppings.splice(newQty); // Kurangi slot topping
            }
            return {
              ...item,
              qty: newQty,
              selectedToppings: newSelectedToppings,
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const updateToppingsInCart = useCallback((itemIndex, newSelectedToppings) => {
    setCart((prevCart) =>
      prevCart.map((item, index) => {
        if (index === itemIndex) {
          return { ...item, selectedToppings: newSelectedToppings };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalQty = useMemo(
    () => cart.reduce((acc, item) => acc + item.qty, 0),
    [cart]
  );

  const cartTotals = useMemo(() => {
    const totals = {
      subtotal: 0,
      totalPb1: 0,
      totalPpn: 0,
      totalService: 0,
      grandTotal: 0,
    };

    cart.forEach((item) => {
      totals.subtotal += item.price * item.qty;
      totals.totalPb1 += (item.pb1 || 0) * item.qty;
      totals.totalPpn += (item.ppn || 0) * item.qty;
      totals.totalService += (item.service || 0) * item.qty;

      const allSelectedToppings = item.selectedToppings?.flat() || [];
      allSelectedToppings.forEach((toppingName) => {
        if (toppingName && toppingName !== "Tanpa Topping") {
          const toppingDetails = item.availableToppings.find(
            (t) => t.topping_nm === toppingName
          );
          if (toppingDetails && toppingDetails.is_free === 0) {
            totals.subtotal += toppingDetails.price || 0;
            totals.totalPb1 += toppingDetails.pb1 || 0;
            totals.totalPpn += toppingDetails.ppn || 0;
            totals.totalService += toppingDetails.service || 0;
          }
        }
      });
    });

    totals.grandTotal =
      totals.subtotal + totals.totalPb1 + totals.totalPpn + totals.totalService;

    return totals;
  }, [cart]);

  return {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateQtyInCart,
    updateToppingsInCart,
    clearCart,
    totalQty,
    cartTotals,
  };
};
