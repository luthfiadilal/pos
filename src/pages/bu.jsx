import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useAuth } from "../contexts/AuthContext";
import { useOrder } from "../contexts/OrderContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getProducts } from "../services/product";

import {
  createOrder,
  processPayment,
  getOrderDetails,
} from "../services/order";
// import { processCashPayment } from "../services/payment";
import { generateTransactionId } from "../utils/transactionHelper";
import GuestInputModal from "../components/table/GuestInputModal";
import ProductList from "../components/pos/ProductList";
import CategoryFilter from "../components/pos/CategoryFilter";
import Cart from "../components/pos/Cart";

import ProductSkeleton from "../components/ui/ProductSkeleton";

const ToppingModal = lazy(() => import("../components/pos/ToppingModal"));
const PaymentMethodModal = lazy(() =>
  import("../components/pos/PaymentMethodModal")
);
// const CashPaymentModal = lazy(() =>
//   import("../components/pos/CashPaymentModal")
// );
// const DebitCreditPaymentModal = lazy(() =>
//   import("../components/pos/DebitCreditPaymentModal")
// );
// const ReceiptModal = lazy(() => import("../components/pos/ReceiptModal"));
// const QRISPaymentModal = lazy(() =>
//   import("../components/pos/QRISPaymentModal")
// );

// const formatCartForCashPayment = (cart) => {
//   if (!cart) return [];

//   return cart.map((item) => {
//     const allToppings = [];
//     for (let i = 0; i < item.qty; i++) {
//       const toppingsForUnit = item.selectedToppings?.[i] || [];
//       toppingsForUnit.forEach((toppingName) => {
//         if (toppingName && toppingName !== "Tanpa Topping") {
//           const toppingDetail = item.availableToppings.find(
//             (t) => t.topping_nm === toppingName
//           );
//           if (toppingDetail) {
//             allToppings.push({ topping_cd: toppingDetail.topping_cd });
//           }
//         }
//       });
//     }

//     return {
//       product_cd: item.id,
//       quantity: item.qty,
//       toppings: allToppings,
//     };
//   });
// };

const formatCartForOrderAPI = (cart) => {
  if (!cart) return [];

  const allUnits = [];

  cart.forEach((item) => {
    for (let i = 0; i < item.qty; i++) {
      const toppingsForThisUnit = item.selectedToppings?.[i] || [];

      const formattedToppings = toppingsForThisUnit
        .filter((toppingName) => toppingName && toppingName !== "Tanpa Topping")
        .map((toppingName) => {
          const toppingDetail = item.availableToppings.find(
            (t) => t.topping_nm === toppingName
          );
          return {
            topping_cd: toppingDetail ? toppingDetail.topping_cd : null,
          };
        })
        .filter((t) => t.topping_cd);

      allUnits.push({
        product_cd: item.id,
        toppings: formattedToppings,
        toppings_key: formattedToppings
          .map((t) => t.topping_cd)
          .sort()
          .join(","),
      });
    }
  });

  const groupedItems = {};

  allUnits.forEach((unit) => {
    const key = `${unit.product_cd}|${unit.toppings_key}`;

    if (!groupedItems[key]) {
      groupedItems[key] = {
        product_cd: unit.product_cd,
        quantity: 1,
        toppings: unit.toppings,
      };
    } else {
      groupedItems[key].quantity += 1;
    }
  });

  return Object.values(groupedItems);
};

export default function POS() {
  const { user, bizType } = useAuth();
  const { draftOrder, saveSession, clearDraftOrder, endTableSession } =
    useOrder();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [setPaymentMethod] = useState("");
  // const [showReceipt, setShowReceipt] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("All Categories");
  const [selectedSubGroup, setSelectedSubGroup] =
    useState("All Sub-categories");
  // const token = localStorage.getItem("token");
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [editingCartItemIndex, setEditingCartItemIndex] = useState(null);
  const [productForToppingSelection, setProductForToppingSelection] =
    useState(null);
  // const [receiptMethod, setReceiptMethod] = useState("");
  // const [cashReceived, setCashReceived] = useState("");
  // const [selectedBank, setSelectedBank] = useState("");
  // const [pin, setPin] = useState("");
  // const [selectedQRIS, setSelectedQRIS] = useState("");
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [paymentOrderDetails, setPaymentOrderDetails] = useState(null);
  const [activeTransactionId, setActiveTransactionId] = useState(null);

  useEffect(() => {
    const orderToPay = location.state?.orderToPay;

    const fetchProductsData = async () => {
      if (!user) {
        setError(new Error("User data not available. Please log in."));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { unit_cd, company_cd, branch_cd } = user;
        const response = await getProducts(unit_cd, company_cd, branch_cd);
        const mappedProducts = response.map((item) => {
          const isSoldOut =
            item.is_sold_out === 1 ||
            item.is_product_stock === 0 ||
            (item.stock && item.stock.ending_qty <= 0);
          const priceInfo =
            item.prices && item.prices.length > 0 ? item.prices[0] : {};
          return {
            id: item.product_cd,
            name: item.product_nm,
            barcode: item.barcode,
            image: item.product_file_img_server,
            stock: item.stock?.ending_qty ?? "N/A",
            isSoldOut: isSoldOut,
            price: priceInfo.sales_price || 0,
            pb1: priceInfo.pb1_amnt || 0,
            ppn: priceInfo.ppn_amnt || 0,
            service: priceInfo.service_amnt || 0,
            effectiveDate: priceInfo.effective_date || "",
            group: item.group ? item.group.product_grp_desc : "Uncategorized",
            subGroup: item.subGroup
              ? item.subGroup.product_subgrp_desc
              : "Uncategorized",
            category:
              item.group && item.subGroup
                ? `${item.group.product_grp_desc} - ${item.subGroup.product_subgrp_desc}`
                : item.group
                ? item.group.product_grp_desc
                : "Uncategorized",
            availableToppings: (item.toppings || []).map((topping) => {
              const toppingPriceInfo =
                topping.toppingPrices && topping.toppingPrices.length > 0
                  ? topping.toppingPrices[0]
                  : {};
              return {
                ...topping,
                price: toppingPriceInfo.sales_price || 0,
                pb1: toppingPriceInfo.pb1_amnt || 0,
                ppn: toppingPriceInfo.ppn_amnt || 0,
                service: toppingPriceInfo.service_amnt || 0,
              };
            }),
            hasToppings: (item.toppings || []).length > 0,
            discount: 0,
          };
        });
        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    const setupPaymentMode = async (session) => {
      setLoading(true);
      try {
        const response = await getOrderDetails(
          session.posOrderNo,
          user.unit_cd,
          user.company_cd,
          user.branch_cd
        );
        const orderDetails = response.data;
        setCart(orderDetails.cart || []);
        setActiveTransactionId(orderDetails.pos_order_no);
        setPaymentOrderDetails({
          table: orderDetails.table,
          guests: orderDetails.guests,
        });
        setShowPaymentModal(true);
      } catch (err) {
        console.error("Gagal mengambil detail order:", err);
        alert("Gagal memuat detail pesanan untuk pembayaran.");
        navigate("/table");
      } finally {
        setLoading(false);
      }
    };

    if (orderToPay && user) {
      setupPaymentMode(orderToPay);
    } else {
      fetchProductsData();
    }
  }, [location.state, user]);

  // const calculateItemTotalPrice = useCallback((item) => {
  //   const allSelectedToppings = item.selectedToppings?.flat() || [];

  //   const toppingsTotalPrice = allSelectedToppings
  //     .map((selectedToppingName) => {
  //       const toppingDetails = item.availableToppings.find(
  //         (t) => t.topping_nm === selectedToppingName
  //       );
  //       if (toppingDetails && toppingDetails.is_free === 0) {
  //         return toppingDetails.toppingPrices?.[0]?.sales_price || 0;
  //       }
  //       return 0;
  //     })
  //     .reduce((sum, price) => sum + price, 0);

  //   return item.price * item.qty + toppingsTotalPrice;
  // }, []);

  const handleAddToCart = useCallback((productToAdd) => {
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

  const handleProductClick = useCallback(
    (product) => {
      if (product.hasToppings) {
        setProductForToppingSelection({
          ...product,
          qty: 1,
          selectedToppings: [""],
        });
        setIsToppingModalOpen(true);
      } else {
        handleAddToCart({ ...product, qty: 1, selectedToppings: [] });
      }
    },
    [handleAddToCart]
  );

  const handleConfirmAddToCart = useCallback(
    (productWithToppings) => {
      handleAddToCart(productWithToppings);
      setIsToppingModalOpen(false);
      setProductForToppingSelection(null);
    },
    [handleAddToCart]
  );

  const handleRemoveItem = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQty = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = Math.max(item.qty + delta, 0);
            if (newQty === 0) return null;
            const newSelectedToppings = [...item.selectedToppings];
            if (delta > 0) {
              newSelectedToppings.push("");
            } else if (newSelectedToppings.length > newQty) {
              newSelectedToppings.splice(newQty);
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

  const handleToppingChange = useCallback(
    (toppingSlotIndex, value) => {
      setCart((prevCart) =>
        prevCart.map((item, index) => {
          if (index === editingCartItemIndex) {
            const newSelectedToppings = [...item.selectedToppings];
            newSelectedToppings[toppingSlotIndex] = value;
            return { ...item, selectedToppings: newSelectedToppings };
          }
          return item;
        })
      );
    },
    [editingCartItemIndex]
  );

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;

    if (bizType === "10002") {
      handleSaveRestoOrder();
    } else {
      setIsGuestModalOpen(true);
    }
  }, [cart, bizType, draftOrder]);

  const handleSaveRestoOrder = async () => {
    if (!draftOrder) {
      alert("Error: Tidak ada data meja. Silakan mulai dari halaman meja.");
      navigate("/table");
      return;
    }

    setIsPaymentLoading(true);
    const posNo = generateTransactionId();

    const payload = {
      ...user,
      pos_no: posNo,
      tbl_cd: draftOrder.table.tbl_cd,
      floor_cd: draftOrder.table.floor_cd,
      name_of_order: draftOrder.guests.name,
      guests_cnt: draftOrder.guests.total,
      guests_men_cnt: draftOrder.guests.men,
      guests_women_cnt: draftOrder.guests.women,
      cart: formatCartForOrderAPI(cart),
      userDetails: { userId: user.user_id, userName: user.name },
    };

    try {
      const response = await createOrder(payload);
      saveSession({
        table: draftOrder.table,
        guests: draftOrder.guests,
        posOrderNo: response.pos_order_no,
      });
      alert(`Order untuk ${draftOrder.guests.name} berhasil disimpan!`);
      clearDraftOrder();
      setCart([]);
      navigate("/table");
    } catch (error) {
      console.error("Gagal menyimpan order Resto:", error);
      alert("Gagal menyimpan pesanan. Silakan coba lagi.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleConfirmCafeOrder = async (guestDetails) => {
    setIsGuestModalOpen(false);
    setIsPaymentLoading(true);

    const posNo = generateTransactionId();
    setActiveTransactionId(posNo);

    const payload = {
      ...user,
      pos_no: posNo,
      tbl_cd: "101",
      floor_cd: "101",
      name_of_order: guestDetails.name,
      guests_cnt: guestDetails.total,
      guests_men_cnt: guestDetails.men,
      guests_women_cnt: guestDetails.women,
      cart: formatCartForOrderAPI(cart),
      userDetails: { userId: user.user_id, userName: user.name },
    };

    try {
      await createOrder(payload);
      setPaymentOrderDetails({ guests: guestDetails });
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Gagal membuat order Cafe:", error);
      alert("Gagal membuat pesanan. Silakan coba lagi.");
      setActiveTransactionId(null);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleProcessPayment = async (paymentData) => {
    if (paymentData.method === "cash") {
      setPaymentMethod("cash");
      setShowPaymentModal(false);
      return;
    }

    if (paymentData.method === "debit") {
      setPaymentMethod("debit");
      setShowPaymentModal(false);
      return;
    }

    setIsPaymentLoading(true);

    let guestInfo = {};
    if (paymentOrderDetails) {
      guestInfo = {
        guests_cnt: paymentOrderDetails.guests.total,
        guests_men_cnt: paymentOrderDetails.guests.men,
        guests_women_cnt: paymentOrderDetails.guests.women,
      };
    }

    const payload = {
      unit_cd: user.unit_cd,
      company_cd: user.company_cd,
      branch_cd: user.branch_cd,
      slip_no: activeTransactionId,
      teller_cd: "T1",
      cart: formatCartForOrderAPI(cart),
      userDetails: { userId: user.user_id, userName: user.name },
      ...guestInfo,
    };

    try {
      const response = await processPayment(payload);
      if (response && response.redirect_url) {
        window.location.href = response.redirect_url;
      } else {
        alert("Pembayaran berhasil!");
        setShowPaymentModal(false);
        setCart([]);
        setActiveTransactionId(null);

        if (paymentOrderDetails) {
          endTableSession(paymentOrderDetails.table.tbl_cd);
          setPaymentOrderDetails(null);
          navigate("/table");
        }
      }
    } catch (error) {
      console.error("Gagal memproses pembayaran:", error);
      alert(error.response?.data?.message || "Gagal memproses pembayaran.");
      setIsPaymentLoading(false);
    }
  };

  // const handlePrintReceipt = useCallback((method) => {
  //   setShowReceipt(true);
  //   setReceiptMethod(method);
  //   setPaymentMethod("");
  //   setCashReceived("");
  //   setSelectedBank("");
  //   setPin("");
  //   setSelectedQRIS("");
  //   setShowCheckoutModal(false);
  // }, []);

  const getToppingSummary = useCallback((item) => {
    const { selectedToppings, availableToppings } = item;
    if (!selectedToppings || selectedToppings.filter((t) => t).length === 0) {
      return null;
    }

    const toppingCounts = selectedToppings.reduce((acc, toppingName) => {
      if (toppingName) {
        acc[toppingName] = (acc[toppingName] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(toppingCounts)
      .map(([toppingName, count]) => {
        const toppingDetails = availableToppings.find(
          (t) => t.topping_nm === toppingName
        );

        if (!toppingDetails) {
          return `${toppingName} (x${count})`;
        }

        const price = toppingDetails.toppingPrices?.[0]?.sales_price || 0;
        const isFree = toppingDetails.is_free === 1;

        if (isFree || price === 0) {
          return `${toppingName} (x${count})`;
        }

        return `${toppingName} (x${count})`;
      })
      .join(", ");
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
      // Kalkulasi untuk produk utama
      totals.subtotal += item.price * item.qty;
      totals.totalPb1 += (item.pb1 || 0) * item.qty;
      totals.totalPpn += (item.ppn || 0) * item.qty;
      totals.totalService += (item.service || 0) * item.qty;

      // Kalkulasi untuk topping
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

  const uniqueGroups = useMemo(
    () => ["All Categories", ...new Set(products.map((p) => p.group))],
    [products]
  );

  const currentSubGroups = useMemo(() => {
    if (selectedGroup === "All Categories") return ["All Sub-categories"];
    const subGroups = new Set(
      products
        .filter((p) => p.group === selectedGroup && p.subGroup)
        .map((p) => p.subGroup)
    );
    return ["All Sub-categories", ...Array.from(subGroups)];
  }, [products, selectedGroup]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesGroup =
        selectedGroup === "All Categories" || product.group === selectedGroup;
      const matchesSubGroup =
        selectedSubGroup === "All Sub-categories" ||
        product.subGroup === selectedSubGroup;
      return matchesGroup && matchesSubGroup;
    });
  }, [products, selectedGroup, selectedSubGroup]);

  const itemForModal = useMemo(() => {
    if (productForToppingSelection) return productForToppingSelection;
    if (editingCartItemIndex !== null) return cart[editingCartItemIndex];
    return null;
  }, [productForToppingSelection, editingCartItemIndex, cart]);

  // const handleDigitalPayment = async () => {
  //   setIsPaymentLoading(true);

  //   const checkoutData = {
  //     unit_cd: user.unit_cd,
  //     company_cd: user.company_cd,
  //     branch_cd: user.branch_cd,
  //     teller_cd: "T1",

  //     cart: cart.map((item) => ({
  //       product_cd: item.id,
  //       product_nm: item.name,
  //       price: item.price,
  //       quantity: item.qty,
  //       toppings: item.selectedToppings
  //         ?.flat()
  //         .filter((name) => name && name !== "Tanpa Topping")
  //         .map((toppingName) => {
  //           const details = item.availableToppings.find(
  //             (t) => t.topping_nm === toppingName
  //           );
  //           return {
  //             topping_cd: String(details?.topping_cd || ""),
  //             topping_nm: String(toppingName),
  //             price: Number(details?.toppingPrices?.[0]?.sales_price || 0),
  //           };
  //         }),
  //     })),

  //     userDetails: {
  //       userId: user?.user_id || "guest-user",
  //       userName: user?.name || "Guest",
  //       userEmail: user?.email || "guest@example.com",
  //       userPhone: user?.phone_no || "081234567890",
  //     },
  //   };

  //   try {
  //     const response = await processPayment(checkoutData);

  //     if (response && response.redirect_url) {
  //       window.location.href = response.redirect_url;
  //     }
  //   } catch (error) {
  //     console.error("Gagal memulai pembayaran:", error);
  //     alert(error.response?.data?.message || "Gagal memulai pembayaran.");
  //     setIsPaymentLoading(false);
  //   }
  // };

  // const handleNewOrder = () => {
  //   setCart([]);
  //   console.log("Pesanan baru dimulai, keranjang dikosongkan.");
  // };

  if (loading)
    return (
      <div className="p-4">
        <ProductSkeleton count={12} />
      </div>
    );
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  const DraftOrderBanner = () => {
    if (bizType !== "10002" || !draftOrder) return null;
    return (
      <div className="p-3 bg-blue-100 text-blue-800 m-2 rounded-lg shadow-sm text-center">
        <p className="font-bold">
          Menyiapkan Pesanan untuk Meja {draftOrder.table.tbl_cd} (a/n{" "}
          {draftOrder.guests.name})
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-7/12 xl:w-8/12 flex flex-col ">
          <DraftOrderBanner />
          <div className="flex-shrink-0 bg-white border-b">
            <CategoryFilter
              categories={uniqueGroups}
              selectedFilter={selectedGroup}
              setFilter={(group) => {
                setSelectedGroup(group);
                setSelectedSubGroup("All Sub-categories");
              }}
              label="Category"
            />
            {currentSubGroups.length > 1 &&
              selectedGroup !== "All Categories" && (
                <CategoryFilter
                  categories={currentSubGroups}
                  selectedFilter={selectedSubGroup}
                  setFilter={setSelectedSubGroup}
                  label="Sub-Category"
                />
              )}
          </div>

          <div className="flex-grow overflow-y-auto bg-white shadow-sm p-2">
            <ProductList
              products={filteredProducts}
              onProductClick={handleProductClick}
            />
          </div>
        </div>

        <div className="w-full lg:w-5/12 xl:w-4/12 relative">
          <Cart
            cart={cart}
            totalQty={totalQty}
            cartTotals={cartTotals}
            handleRemoveItem={handleRemoveItem}
            updateQty={updateQty}
            // calculateItemTotalPrice={calculateItemTotalPrice}
            getToppingSummary={getToppingSummary}
            onEditToppings={(index) => {
              setEditingCartItemIndex(index);
              setIsToppingModalOpen(true);
            }}
            handleCheckout={handleCheckout}
          />
        </div>
      </div>

      <div className="flex-shrink-0"></div>

      <Suspense
        fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center text-white">
            Loading...
          </div>
        }
      >
        {isToppingModalOpen && itemForModal && (
          <ToppingModal
            key={itemForModal.id || editingCartItemIndex}
            item={itemForModal}
            mode={productForToppingSelection ? "add" : "edit"}
            onClose={() => {
              setIsToppingModalOpen(false);
              setProductForToppingSelection(null);
              setEditingCartItemIndex(null);
            }}
            onConfirmAddToCart={handleConfirmAddToCart}
            onSaveChanges={handleToppingChange}
          />
        )}
        {showPaymentModal && (
          <PaymentMethodModal
            onClose={() => setShowPaymentModal(false)}
            onSelectCash={() => handleProcessPayment({ method: "cash" })}
            onSelectDebit={() => handleProcessPayment({ method: "debit" })}
            onSelectDigital={() => handleProcessPayment({ method: "digital" })}
            isLoading={isPaymentLoading}
            cart={cart}
            cartTotals={cartTotals}
          />
        )}
        {/* {paymentMethod === "cash" && (
          <CashPaymentModal
            totalAmount={totalAmount}
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            cart={formatCartForCashPayment(cart)}
            handlePrintReceipt={handlePrintReceipt}
            processCashPayment={processCashPayment}
            activeTransactionId={activeTransactionId}
            user={user}
          />
        )}
        {paymentMethod === "debit" && (
          <DebitCreditPaymentModal
            totalAmount={totalAmount}
            selectedBank={selectedBank}
            setSelectedBank={setSelectedBank}
            pin={pin}
            setPin={setPin}
            handlePrintReceipt={handlePrintReceipt}
          />
        )}

        {paymentMethod === "qris" && (
          <QRISPaymentModal
            totalAmount={totalAmount}
            selectedQRIS={selectedQRIS}
            setSelectedQRIS={setSelectedQRIS}
            handlePrintReceipt={handlePrintReceipt}
          />
        )}
        {showReceipt && (
          <ReceiptModal
            receiptMethod={receiptMethod}
            cart={cart}
            totalAmount={totalAmount}
            setShowReceipt={setShowReceipt}
            setCart={setCart}
            getToppingSummary={getToppingSummary}
            calculateItemTotalPrice={calculateItemTotalPrice}
          />
        )} */}
      </Suspense>
      <GuestInputModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onConfirm={handleConfirmCafeOrder}
        bizType={bizType}
      />
    </div>
  );
}
